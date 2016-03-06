/**
 * Execute the user's code.
 * Just a quick and dirty eval.  No checks for infinite loops, etc.
 */
function runJS() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  try {
    eval(code);
  } catch (e) {
    alert('Program error:\n' + e);
  }
}

/**
 * Backup code blocks to localStorage.
 */
function backup_blocks() {
  if ('localStorage' in window) {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    window.localStorage.setItem('arduino', Blockly.Xml.domToText(xml));
  }
}

/**
 * Restore code blocks from localStorage.
 */
function restore_blocks() {
  if ('localStorage' in window && window.localStorage.arduino) {
    var xml = Blockly.Xml.textToDom(window.localStorage.arduino);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  }
}

/**
* Save Arduino generated code to local file.
*/
function saveCode() {
  var fileName = window.prompt(Blockly.Msg.WHAT_NAME_FOR_FILE, 'Blockly4Arduino')
  //doesn't save if the user quits the save prompt
  if(fileName){
    var blob = new Blob([Blockly.Arduino.workspaceToCode()], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, fileName + '.ino');
  }
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function save() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var data = Blockly.Xml.domToText(xml);
  var fileName = window.prompt(Blockly.Msg.WHAT_NAME_FOR_FILE, 'Blockly4Arduino');
  // Store data in blob.
  // var builder = new BlobBuilder();
  // builder.append(data);
  // saveAs(builder.getBlob('text/plain;charset=utf-8'), 'blockduino.xml');
  if(fileName){
    var blob = new Blob([data], {type: 'text/xml'});
    saveAs(blob, fileName + ".xml");
  } 
}

/**
 * Load blocks from local file.
 */
function load(event) {
  var files = event.target.files;
  // Only allow uploading one file.
  if (files.length != 1) {
    return;
  }

  // FileReader
  var reader = new FileReader();
  reader.onloadend = function(event) {
    var target = event.target;
    // 2 == FileReader.DONE
    if (target.readyState == 2) {
      try {
        var xml = Blockly.Xml.textToDom(target.result);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm(Blockly.Msg.REPLACE_EXISTING_BLOCKS)) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    }
    // Reset value of input after loading because Chrome will not fire
    // a 'change' event if the same file is loaded again.
    document.getElementById('load').value = '';
  };
  reader.readAsText(files[0]);
}

/**
 * Discard all blocks from the workspace.
 */
function discard() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 || window.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count))) {
    Blockly.mainWorkspace.clear();
    renderContent();
  }
}

/*
 * auto save and restore blocks
 */
function auto_save_and_restore_blocks() {
  // Restore saved blocks in a separate thread so that subsequent
  // initialization is not affected from a failed load.
  window.setTimeout(restore_blocks, 0);
  // Hook a save function onto unload.
  bindEvent(window, 'unload', backup_blocks);
  tabClick(selected);

  // Init load event.
  var loadInput = document.getElementById('load');
  loadInput.addEventListener('change', load, false);
  document.getElementById('fakeload').onclick = function() {
    loadInput.click();
  };
}

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 *     W3 browsers will call the function with the event object as a parameter,
 *     MSIE will not.
 */
function bindEvent(element, name, func) {
  if (element.addEventListener) {  // W3C
    element.addEventListener(name, func, false);
  } else if (element.attachEvent) {  // IE
    element.attachEvent('on' + name, func);
  }
}

//loading examples via ajax
var ajax;
function createAJAX() {
  if (window.ActiveXObject) { //IE
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e2) {
        return null;
      }
    }
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return null;
  }
}

function onSuccess() {
  if (ajax.readyState == 4) {
    if (ajax.status == 200) {
      try {
      var xml = Blockly.Xml.textToDom(ajax.responseText);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    } else {
      alert("Server error");
    }
  }
}

function load_by_url(uri) {
  ajax = createAJAX();
  if (!ajax) {
　　   alert ('Not compatible with XMLHttpRequest');
　　   return 0;
　  }
  if (ajax.overrideMimeType) {
    ajax.overrideMimeType('text/xml');
  }

　　ajax.onreadystatechange = onSuccess;
　　ajax.open ("GET", uri, true);
　　ajax.send ("");
}

function uploadCode(code, callback) {
    var target = document.getElementById('content_arduino');
    var spinner = new Spinner().spin(target);

    var url = "http://127.0.0.1:8080/";
    var method = "POST";

    // You REALLY want async = true.
    // Otherwise, it'll block ALL execution waiting for server response.
    var async = true;

    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState != 4) { 
            return; 
        }
        
        spinner.stop();
        
        var status = parseInt(request.status); // HTTP response status, e.g., 200 for "200 OK"
        var errorInfo = null;
        switch (status) {
        case 200:
            break;
        case 0:
            errorInfo = "code 0\n\nCould not connect to server at " + url + ".  Is the local web server running?";
            break;
        case 400:
            errorInfo = "code 400\n\nBuild failed - probably due to invalid source code.  Make sure that there are no missing connections in the blocks.";
            break;
        case 500:
            errorInfo = "code 500\n\nUpload failed.  Is the Arduino connected to USB port?";
            break;
        case 501:
            errorInfo = "code 501\n\nUpload failed.  Is 'ino' installed and in your path?  This only works on Mac OS X and Linux at this time.";
            break;
        default:
            errorInfo = "code " + status + "\n\nUnknown error.";
            break;
        };
        
        callback(status, errorInfo);
    };

    request.open(method, url, async);
    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    request.send(code);	     
}

function uploadClick() {
    alert(Blockly.Msg.UPLOAD_CLICK_1 + "\n" + 
          Blockly.Msg.UPLOAD_CLICK_2 + "\n" + 
	  Blockly.Msg.UPLOAD_CLICK_3 + "\n" + 
	  Blockly.Msg.UPLOAD_CLICK_4 + "\n" + 
	  Blockly.Msg.UPLOAD_CLICK_5 );
    /*
    var code = document.getElementById('content_arduino').value;

    alert("Ready to upload to Arduino.");
    
    uploadCode(code, function(status, errorInfo) {
        if (status == 200) {
            alert("Program uploaded ok");
        } else {
            alert("Error uploading program: " + errorInfo);
        }
    });
    */
}

function resetClick() {
    var code = "void setup() {} void loop() {}";

    uploadCode(code, function(status, errorInfo) {
        if (status != 200) {
            alert("Error resetting program: " + errorInfo);
        }
    });
}

function ledupClick(){
    var ledupxml =  ` <xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="declare_var_digout" id="w3CaDnGucw?0cTTwH%d}" x="38" y="38">
    <field name="NAME">LED0</field>
    <field name="PIN">2</field>
    <next>
      <block type="declare_var_digout" id="!6M6raN4o6FTjV3lrQiv">
        <field name="NAME">LED1</field>
        <field name="PIN">3</field>
        <next>
          <block type="declare_var_digout" id="=yTAs.){s6%~YRd;TX-">
            <field name="NAME">LED2</field>
            <field name="PIN">4</field>
            <next>
              <block type="declare_var_digout" id="I!{j{2vo}R;]s4]VA/w*">
                <field name="NAME">LED3</field>
                <field name="PIN">5</field>
                <next>
                  <block type="declare_var_digout" id="VC6ZD;O1cxnFaO0pL](">
                    <field name="NAME">LED4</field>
                    <field name="PIN">6</field>
                    <next>
                      <block type="declare_var_digout" id="~m4FTl9SPKgUhW}D*U_y">
                        <field name="NAME">LED5</field>
                        <field name="PIN">7</field>
                        <next>
                          <block type="declare_var_bool" id="t.}.e{g_N{J(REi42qJ/">
                            <field name="NAME">AAN</field>
                            <value name="NUM">
                              <block type="io_highlow" id="/i(nmLaP_teS0fh8eAr}">
                                <field name="STATE">LOW</field>
                              </block>
                            </value>
                            <next>
                              <block type="declare_var_bool" id="%oqqHSbd;3~t.E,k,S3">
                                <field name="NAME">UIT</field>
                                <value name="NUM">
                                  <block type="io_highlow" id="!e,nJl:r+|IF,D_BLwA">
                                    <field name="STATE">HIGH</field>
                                  </block>
                                </value>
                                <next>
                                  <block type="declare_var_int" id="bpQ^pRgh0/09u2_O1@o*">
                                    <field name="NAME">FlikkerSnelheid</field>
                                    <value name="NUM">
                                      <block type="math_number" id="9J(,Y,-Dp5(pd*jVb9Gp">
                                        <field name="NUM">50</field>
                                      </block>
                                    </value>
                                    <next>
                                      <block type="declare_var_int" id="K5%=UMEH[=M*^QzCE--B">
                                        <field name="NAME">FlikkerAantal</field>
                                        <value name="NUM">
                                          <block type="math_number" id="L)o8s.Wf)rlQs-pHcipx">
                                            <field name="NUM">50</field>
                                          </block>
                                        </value>
                                        <next>
                                          <block type="declare_var_int" id="gG4W-S~VCa9K~bQ^w!3X">
                                            <field name="NAME">DraaiSnelheid</field>
                                            <value name="NUM">
                                              <block type="math_number" id="paVc(#EP)AGeh*80nY[M">
                                                <field name="NUM">20</field>
                                              </block>
                                            </value>
                                            <next>
                                              <block type="declare_var_int" id="5~8rtctw-4Xzld@~RE=7">
                                                <field name="NAME">DraaiAantal</field>
                                                <value name="NUM">
                                                  <block type="math_number" id="6!vh)!un+KI*XLaI4FbI">
                                                    <field name="NUM">50</field>
                                                  </block>
                                                </value>
                                                <next>
                                                  <block type="procedures_callnoreturn" id="OU~J(i;+=YD,+woEf*%V">
                                                    <mutation name="EffectFlikker"></mutation>
                                                    <next>
                                                      <block type="procedures_callnoreturn" id="xa1bM*mJfP.e+-X;%|W">
                                                        <mutation name="EffectDraaien"></mutation>
                                                        <next>
                                                          <block type="time_delay" id="y]ev_L)SC+ZL.a/7lAYR">
                                                            <value name="DELAY_TIME_MILI">
                                                              <block type="math_number" id="Jk8Ee=@J2Ld9xhfWO7p_">
                                                                <field name="NUM">2000</field>
                                                              </block>
                                                            </value>
                                                          </block>
                                                        </next>
                                                      </block>
                                                    </next>
                                                  </block>
                                                </next>
                                              </block>
                                            </next>
                                          </block>
                                        </next>
                                      </block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
  <block type="procedures_defnoreturn" id="L4v7SV1kU-=X=@j0C.~" x="438" y="38">
    <field name="NAME">EffectUit</field>
    <comment pinned="false" h="80" w="160">Deze functie beschrijven...</comment>
    <statement name="STACK">
      <block type="io_digitalwrite_var" id="CpIP{oQA#f/*K]IQ;s}6">
        <field name="PIN">LED0</field>
        <value name="STATE">
          <block type="variables_get" id="2Hqg?vY7,0gu{hG(B~3@">
            <field name="VAR">UIT</field>
          </block>
        </value>
        <next>
          <block type="io_digitalwrite_var" id="(c5V+30%l?URKFJoL5Ct">
            <field name="PIN">LED1</field>
            <value name="STATE">
              <block type="variables_get" id="1Pjf%+0B^d!3HzE/Sj3L">
                <field name="VAR">UIT</field>
              </block>
            </value>
            <next>
              <block type="io_digitalwrite_var" id="*v?I*n+p*a@.2wqeJqM_">
                <field name="PIN">LED2</field>
                <value name="STATE">
                  <block type="variables_get" id="j[_frl:wXJ6w4v@x^9s/">
                    <field name="VAR">UIT</field>
                  </block>
                </value>
                <next>
                  <block type="io_digitalwrite_var" id=",_kZkeba+D;/~OeyO?bh">
                    <field name="PIN">LED3</field>
                    <value name="STATE">
                      <block type="variables_get" id="kl{=%y_wFPl!8KGKXJZd">
                        <field name="VAR">UIT</field>
                      </block>
                    </value>
                    <next>
                      <block type="io_digitalwrite_var" id="!nmiU8Izfk6dyfEiXlI^">
                        <field name="PIN">LED4</field>
                        <value name="STATE">
                          <block type="variables_get" id="s_|.[V2eoBm6.#n{T[D">
                            <field name="VAR">UIT</field>
                          </block>
                        </value>
                        <next>
                          <block type="io_digitalwrite_var" id="NH8O]akIm8%g!=j0N?A5">
                            <field name="PIN">LED5</field>
                            <value name="STATE">
                              <block type="variables_get" id="[7PYLltQdM/pN%F@z,1A">
                                <field name="VAR">UIT</field>
                              </block>
                            </value>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="procedures_defnoreturn" id=":!C08{rMc0[9+No/H])" x="438" y="238">
    <field name="NAME">EffectAan</field>
    <comment pinned="false" h="80" w="160">Deze functie beschrijven...</comment>
    <statement name="STACK">
      <block type="io_digitalwrite_var" id="LW;!oQ?Cq%2/M4fST)(a">
        <field name="PIN">LED0</field>
        <value name="STATE">
          <block type="variables_get" id="eV,6^q(J*joCXdDYX4qf">
            <field name="VAR">AAN</field>
          </block>
        </value>
        <next>
          <block type="io_digitalwrite_var" id=")@7ojaXoHqRgl#YgTy7;">
            <field name="PIN">LED1</field>
            <value name="STATE">
              <block type="variables_get" id="q:|q[+E2W8D3g?Ph[UV">
                <field name="VAR">AAN</field>
              </block>
            </value>
            <next>
              <block type="io_digitalwrite_var" id="1uUP0|0=oV2=he2:o;zZ">
                <field name="PIN">LED2</field>
                <value name="STATE">
                  <block type="variables_get" id="KJG{J@Z#iAK:byn1JP8z">
                    <field name="VAR">AAN</field>
                  </block>
                </value>
                <next>
                  <block type="io_digitalwrite_var" id="uVO|R;aa1)wl-4^=Yj%r">
                    <field name="PIN">LED3</field>
                    <value name="STATE">
                      <block type="variables_get" id="jq.Nz3vl*VR}JSu0(#Bc">
                        <field name="VAR">AAN</field>
                      </block>
                    </value>
                    <next>
                      <block type="io_digitalwrite_var" id="as^{2~WXMnpxCv?|^*r2">
                        <field name="PIN">LED4</field>
                        <value name="STATE">
                          <block type="variables_get" id="7D%YOu@/e~)e)ENmaLBo">
                            <field name="VAR">AAN</field>
                          </block>
                        </value>
                        <next>
                          <block type="io_digitalwrite_var" id="m7}{{h}]zjZ4XWY1=n_A">
                            <field name="PIN">LED5</field>
                            <value name="STATE">
                              <block type="variables_get" id="w4H~LaF!%HXBcnjd@:C">
                                <field name="VAR">AAN</field>
                              </block>
                            </value>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="procedures_defnoreturn" id="1y1;EuB~O,4)6KC8X/1!" x="438" y="438">
    <field name="NAME">EffectFlikker</field>
    <comment pinned="false" h="80" w="160">Deze functie beschrijven...</comment>
    <statement name="STACK">
      <block type="controls_for" id="7VxoGOWI}JejCN1fNai|">
        <field name="VAR">i</field>
        <value name="FROM">
          <block type="math_number" id="Zd*GvtlME*znNitL/Dil">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="variables_get" id="w~XLubLd+qg8dtFEUUMj">
            <field name="VAR">FlikkerAantal</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number" id="+02sBgJqf|?dRY#Cpk,_">
            <field name="NUM">1</field>
          </block>
        </value>
        <statement name="DO">
          <block type="procedures_callnoreturn" id="PXG[Z1%m_8s^T.Nf@t.y">
            <mutation name="EffectAan"></mutation>
            <next>
              <block type="time_delay" id="{F_gL4qY%k!(nQ2n?tr*">
                <value name="DELAY_TIME_MILI">
                  <block type="variables_get" id="]OY)1FB[EXsPUp.Ya_3;">
                    <field name="VAR">FlikkerSnelheid</field>
                  </block>
                </value>
                <next>
                  <block type="procedures_callnoreturn" id="45mLH.tL)+5?SOd).o-">
                    <mutation name="EffectUit"></mutation>
                    <next>
                      <block type="time_delay" id="{T^3zuS_rZ{m(:uknyJe">
                        <value name="DELAY_TIME_MILI">
                          <block type="variables_get" id="Cr)e*]o%:IwC,nB!:%wY">
                            <field name="VAR">FlikkerSnelheid</field>
                          </block>
                        </value>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
  <block type="procedures_defnoreturn" id="7yEWs/Ks,mwGgy6gQW9d" x="438" y="662">
    <field name="NAME">EffectDraaien</field>
    <comment pinned="false" h="80" w="160">Deze functie beschrijven...</comment>
    <statement name="STACK">
      <block type="controls_for" id="S?rr13u4}P6L(F-C3%66">
        <field name="VAR">i</field>
        <value name="FROM">
          <block type="math_number" id="b9/*2pE^(MyXI)KiLzgz">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="variables_get" id="o[/G6;z%N2X0XS6o?{E/">
            <field name="VAR">DraaiAantal</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number" id="ZD2kWw0V}Iq-Tq1dd[Vr">
            <field name="NUM">1</field>
          </block>
        </value>
        <statement name="DO">
          <block type="procedures_callnoreturn" id="jxqfA7N3dTaExm:Mj3CP">
            <mutation name="EffectUit"></mutation>
            <next>
              <block type="io_digitalwrite_var" id="Cb7SwC,_.hWIy3l]JOU">
                <field name="PIN">LED0</field>
                <value name="STATE">
                  <block type="variables_get" id="~}6X)hawTy@km9naX.|K">
                    <field name="VAR">AAN</field>
                  </block>
                </value>
                <next>
                  <block type="time_delay" id="Q2DclRaEKe5+[fTPdF{j">
                    <value name="DELAY_TIME_MILI">
                      <block type="variables_get" id="?LAN[nlT~8hi1@=6%e?n">
                        <field name="VAR">DraaiSnelheid</field>
                      </block>
                    </value>
                    <next>
                      <block type="io_digitalwrite_var" id="I%SAm?,7}7hH6oes|r;|">
                        <field name="PIN">LED0</field>
                        <value name="STATE">
                          <block type="variables_get" id="k4?_s]?AyEB|w/?dNu_5">
                            <field name="VAR">UIT</field>
                          </block>
                        </value>
                        <next>
                          <block type="io_digitalwrite_var" id="72bO]R%s5VII.?;XxMI">
                            <field name="PIN">LED1</field>
                            <value name="STATE">
                              <block type="variables_get" id="ZC03Za%*=Z^@eC?bZ:1">
                                <field name="VAR">AAN</field>
                              </block>
                            </value>
                            <next>
                              <block type="time_delay" id="MI/xHA-jNS.~2FVwOy2V">
                                <value name="DELAY_TIME_MILI">
                                  <block type="variables_get" id="mahp1F7,~7[c#XHdUvG-">
                                    <field name="VAR">DraaiSnelheid</field>
                                  </block>
                                </value>
                                <next>
                                  <block type="io_digitalwrite_var" id="|mS!V4z4HPRK:vVkTV7">
                                    <field name="PIN">LED1</field>
                                    <value name="STATE">
                                      <block type="variables_get" id="DFo7m/dI)Mrew]FXg:Oq">
                                        <field name="VAR">UIT</field>
                                      </block>
                                    </value>
                                    <next>
                                      <block type="io_digitalwrite_var" id="v,;R=Z{0,qPPVc?|_JNt">
                                        <field name="PIN">LED2</field>
                                        <value name="STATE">
                                          <block type="variables_get" id="p{gs/F7W)MmjDd_]R{e">
                                            <field name="VAR">AAN</field>
                                          </block>
                                        </value>
                                        <next>
                                          <block type="time_delay" id="(h4=Oa(dKRi~yE7l[R=b">
                                            <value name="DELAY_TIME_MILI">
                                              <block type="variables_get" id="=FdUaPi.BO=tYUoXhk-9">
                                                <field name="VAR">DraaiSnelheid</field>
                                              </block>
                                            </value>
                                            <next>
                                              <block type="io_digitalwrite_var" id="tBU{j9_^g:0nHYmg6r*W">
                                                <field name="PIN">LED2</field>
                                                <value name="STATE">
                                                  <block type="variables_get" id="8xM]+_Eq2c^P-MT?8=X">
                                                    <field name="VAR">UIT</field>
                                                  </block>
                                                </value>
                                                <next>
                                                  <block type="io_digitalwrite_var" id="agV}=3rzK7j0SnnI,{6B">
                                                    <field name="PIN">LED3</field>
                                                    <value name="STATE">
                                                      <block type="variables_get" id="hfG^,+.p6j-KDD3*3rGN">
                                                        <field name="VAR">AAN</field>
                                                      </block>
                                                    </value>
                                                    <next>
                                                      <block type="time_delay" id="b%^WAHgyYS~3.Tybh/Yp">
                                                        <value name="DELAY_TIME_MILI">
                                                          <block type="variables_get" id="H=7~_5#[,ja5Y_)auR3y">
                                                            <field name="VAR">DraaiSnelheid</field>
                                                          </block>
                                                        </value>
                                                        <next>
                                                          <block type="io_digitalwrite_var" id="8CnZQuczBVOGWhT8LxN@">
                                                            <field name="PIN">LED3</field>
                                                            <value name="STATE">
                                                              <block type="variables_get" id="yR3C2Ea_BO(y8Zik[l0?">
                                                                <field name="VAR">UIT</field>
                                                              </block>
                                                            </value>
                                                            <next>
                                                              <block type="io_digitalwrite_var" id="*s%3}2pjb_;ecz/l,Ue%">
                                                                <field name="PIN">LED4</field>
                                                                <value name="STATE">
                                                                  <block type="variables_get" id="c0Z-mp/zsR0jb%VDX;F">
                                                                    <field name="VAR">AAN</field>
                                                                  </block>
                                                                </value>
                                                                <next>
                                                                  <block type="time_delay" id="1fSmlLtUNj#kv@j6TU/g">
                                                                    <value name="DELAY_TIME_MILI">
                                                                      <block type="variables_get" id="P1@Lc=Jf:sGT[P7QCUPd">
                                                                        <field name="VAR">DraaiSnelheid</field>
                                                                      </block>
                                                                    </value>
                                                                    <next>
                                                                      <block type="io_digitalwrite_var" id="7kBJ:N;=S9?,Jn{mTzw;">
                                                                        <field name="PIN">LED4</field>
                                                                        <value name="STATE">
                                                                          <block type="variables_get" id="]nsLj+eq,2h4Da1A*yB8">
                                                                            <field name="VAR">UIT</field>
                                                                          </block>
                                                                        </value>
                                                                        <next>
                                                                          <block type="io_digitalwrite_var" id="kMOK[DKSpzjbZa)4Ps6(">
                                                                            <field name="PIN">LED5</field>
                                                                            <value name="STATE">
                                                                              <block type="variables_get" id="Gt(_tIY)7Si4iO-/ZtbK">
                                                                                <field name="VAR">AAN</field>
                                                                              </block>
                                                                            </value>
                                                                            <next>
                                                                              <block type="time_delay" id="pDn:6o}N9^OY/TDk_tDM">
                                                                                <value name="DELAY_TIME_MILI">
                                                                                  <block type="variables_get" id="B|pch83-mK,lc}44dxZ">
                                                                                    <field name="VAR">DraaiSnelheid</field>
                                                                                  </block>
                                                                                </value>
                                                                              </block>
                                                                            </next>
                                                                          </block>
                                                                        </next>
                                                                      </block>
                                                                    </next>
                                                                  </block>
                                                                </next>
                                                              </block>
                                                            </next>
                                                          </block>
                                                        </next>
                                                      </block>
                                                    </next>
                                                  </block>
                                                </next>
                                              </block>
                                            </next>
                                          </block>
                                        </next>
                                      </block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`
  
    try {
        var xml = Blockly.Xml.textToDom(ledupxml);
    } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
    }
    var count = Blockly.mainWorkspace.getAllBlocks().length;
    if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
    }
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    // Reset value of input after loading because Chrome will not fire
    // a 'change' event if the same file is loaded again.
    document.getElementById('load').value = '';
}
