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
  
  <block type="declare_var" id="T~lR8h6YU8c5Nr*IH7g2" x="38" y="13">
    <value name="NAME">
      <block type="variables_get" id="aXP{jY^ZUfBlxZ,;^BVa">
        <field name="VAR">LED0</field>
      </block>
    </value>
    <value name="NUM">
      <block type="math_number" id="KLDU1f8Od*wuSA+nS-U">
        <field name="NUM">2</field>
      </block>
    </value>
    <next>
      <block type="declare_var" id="p#}FCY%ZOimo#Ey?jp#T">
        <value name="NAME">
          <block type="variables_get" id="@Pz=p~2ASI6N3Bd_@~K">
            <field name="VAR">LED1</field>
          </block>
        </value>
        <value name="NUM">
          <block type="math_number" id="BBw9TjJUH*BNdMi8TJh">
            <field name="NUM">3</field>
          </block>
        </value>
        <next>
          <block type="declare_var" id="YhO,RPxd#vtG:UfFSar6">
            <value name="NAME">
              <block type="variables_get" id="DGSgKE=odO{Sfl;g@;(i">
                <field name="VAR">LED2</field>
              </block>
            </value>
            <value name="NUM">
              <block type="math_number" id="ZmiIEnFrt6tCD7l%N{l~">
                <field name="NUM">4</field>
              </block>
            </value>
            <next>
              <block type="declare_var" id="C1_V^gyjfCwjp0u8+%(u">
                <value name="NAME">
                  <block type="variables_get" id="oYk0p+UQy-Fhxv%BFevW">
                    <field name="VAR">LED3</field>
                  </block>
                </value>
                <value name="NUM">
                  <block type="math_number" id="EHTc@!hql|V=QmaUp}m">
                    <field name="NUM">5</field>
                  </block>
                </value>
                <next>
                  <block type="declare_var" id="sQD|o:rcLyDM#W!*M?8z">
                    <value name="NAME">
                      <block type="variables_get" id="b/kdtDVa?|QjLmuytS[B">
                        <field name="VAR">LED4</field>
                      </block>
                    </value>
                    <value name="NUM">
                      <block type="math_number" id="FI9!l|4bAo7Dp{HO1}r">
                        <field name="NUM">6</field>
                      </block>
                    </value>
                    <next>
                      <block type="declare_var" id="h?)bxzUSC6KxGl5t[[~W">
                        <value name="NAME">
                          <block type="variables_get" id="_#({~zEL%aq#3PosQnW0">
                            <field name="VAR">LED5</field>
                          </block>
                        </value>
                        <value name="NUM">
                          <block type="math_number" id="Wo^2s:}2|pa{X%r*?h)K">
                            <field name="NUM">7</field>
                          </block>
                        </value>
                        <next>
                          <block type="declare_var" id="pfAFxPjvch~jvZnfc8[B">
                            <value name="NAME">
                              <block type="variables_get" id="hJt4oFdtZcO~l}3#W|tI">
                                <field name="VAR">AAN</field>
                              </block>
                            </value>
                            <value name="NUM">
                              <block type="math_number" id="5!H2[Ld|mS.0%tk8=]AM">
                                <field name="NUM">0</field>
                              </block>
                            </value>
                            <next>
                              <block type="declare_var" id="{-Zuidy*rBn@z)qew)zB">
                                <value name="NAME">
                                  <block type="variables_get" id="WR,l7~Q0Rt2r%/*OPDYZ">
                                    <field name="VAR">UIT</field>
                                  </block>
                                </value>
                                <value name="NUM">
                                  <block type="math_number" id="%J=L0^wYe@-7|@UR9dA+">
                                    <field name="NUM">1</field>
                                  </block>
                                </value>
                                <next>
                                  <block type="variables_set" id="87">
                                    <field name="VAR">UIT</field>
                                    <value name="VALUE">
                                      <block type="inout_highlow" id="88">
                                        <field name="BOOL">HIGH</field>
                                      </block>
                                    </value>
                                    <next>
                                      <block type="variables_set" id="89">
                                        <field name="VAR">AAN</field>
                                        <value name="VALUE">
                                          <block type="inout_highlow" id="90">
                                            <field name="BOOL">LOW</field>
                                          </block>
                                        </value>
                                        <next>
                                          <block type="variables_set" id="91">
                                            <field name="VAR">FlikkerSnelheid</field>
                                            <value name="VALUE">
                                              <block type="math_number" id="92">
                                                <field name="NUM">50</field>
                                              </block>
                                            </value>
                                            <next>
                                              <block type="variables_set" id="93">
                                                <field name="VAR">FlikkerAantal</field>
                                                <value name="VALUE">
                                                  <block type="math_number" id="94">
                                                    <field name="NUM">50</field>
                                                  </block>
                                                </value>
                                                <next>
                                                  <block type="procedures_callnoreturn" id="95">
                                                    <mutation name="EffectFlikker"></mutation>
                                                    <next>
                                                      <block type="procedures_callnoreturn" id="96">
                                                        <mutation name="EffectUit"></mutation>
                                                        <next>
                                                          <block type="base_delay" id="97">
                                                            <value name="DELAY_TIME">
                                                              <block type="math_number" id="98">
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
  <block type="procedures_defnoreturn" id="57" x="438" y="13">
    <field name="NAME">EffectUit</field>
    <comment pinned="false" h="80" w="160">Describe this function...</comment>
    <statement name="STACK">
      <block type="inout_digital_write_var" id="@Bji1VJCTLu|@o]X,mM#">
        <value name="PIN">
          <block type="variables_get" id=";0BV:6yE)ErjyVnbf4W">
            <field name="VAR">LED0</field>
          </block>
        </value>
        <value name="STATUS">
          <block type="variables_get" id="1f.gIp(;^As]F8PZf_#R">
            <field name="VAR">UIT</field>
          </block>
        </value>
        <next>
          <block type="inout_digital_write_var" id="/7C:eS=CI@kFt]CiTJ%c">
            <value name="PIN">
              <block type="variables_get" id="kM!Yw%)*K7sXNw7!ekg">
                <field name="VAR">LED1</field>
              </block>
            </value>
            <value name="STATUS">
              <block type="variables_get" id="tFXUl5)X*mUS+XXCp9gU">
                <field name="VAR">UIT</field>
              </block>
            </value>
            <next>
              <block type="inout_digital_write_var" id="qJ-HNM8yN4Oj?9D1#5E[">
                <value name="PIN">
                  <block type="variables_get" id="/55bD)wP/Ia]),+W?Ae=">
                    <field name="VAR">LED2</field>
                  </block>
                </value>
                <value name="STATUS">
                  <block type="variables_get" id="lZ1sY*2/JAcF?C,y.YC">
                    <field name="VAR">UIT</field>
                  </block>
                </value>
                <next>
                  <block type="inout_digital_write_var" id="nM*#bDy^#ipwfb5[d_R4">
                    <value name="PIN">
                      <block type="variables_get" id="H##yB#g1;/Vhh|xhCQQM">
                        <field name="VAR">LED3</field>
                      </block>
                    </value>
                    <value name="STATUS">
                      <block type="variables_get" id="Z2n/2g5d[ivmxdm?G4PO">
                        <field name="VAR">UIT</field>
                      </block>
                    </value>
                    <next>
                      <block type="inout_digital_write_var" id="I2T#_I}CQAGp~)6Acl^|">
                        <value name="PIN">
                          <block type="variables_get" id="-r5k~knQSFbt3yjj[z4B">
                            <field name="VAR">LED4</field>
                          </block>
                        </value>
                        <value name="STATUS">
                          <block type="variables_get" id="SGOzUXqhX!aXC5z(Gk0">
                            <field name="VAR">UIT</field>
                          </block>
                        </value>
                        <next>
                          <block type="inout_digital_write_var" id="vOQ#C1aNu@jm_pQ!Lxj">
                            <value name="PIN">
                              <block type="variables_get" id="{Lx3Xzm,GKUa)|0QTqy[">
                                <field name="VAR">LED5</field>
                              </block>
                            </value>
                            <value name="STATUS">
                              <block type="variables_get" id="DLSVz[VKwnIX:H09f,p?">
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
  <block type="procedures_defnoreturn" id="50" x="438" y="288">
    <field name="NAME">EffectAan</field>
    <comment pinned="false" h="80" w="160">Describe this function...</comment>
    <statement name="STACK">
      <block type="inout_digital_write_var" id="CbI6f0^IWbV#Z8w[YM_B">
        <value name="PIN">
          <block type="variables_get" id="qWoY~3HOx;;msXM;]TN.">
            <field name="VAR">LED0</field>
          </block>
        </value>
        <value name="STATUS">
          <block type="variables_get" id="Z5tvuI2L2pTsxZc3g|A">
            <field name="VAR">AAN</field>
          </block>
        </value>
        <next>
          <block type="inout_digital_write_var" id="KBF_2*o1vP_[0[t-XBIt">
            <value name="PIN">
              <block type="variables_get" id="?C0zO*mHg/g?b-1ORCdP">
                <field name="VAR">LED1</field>
              </block>
            </value>
            <value name="STATUS">
              <block type="variables_get" id="}qq#M|wEnkHcfXH9Bn^b">
                <field name="VAR">AAN</field>
              </block>
            </value>
            <next>
              <block type="inout_digital_write_var" id="9~dUef)uBF^Z,+m|F5W">
                <value name="PIN">
                  <block type="variables_get" id="dB#2]Yd(8,*u*(69SBx=">
                    <field name="VAR">LED2</field>
                  </block>
                </value>
                <value name="STATUS">
                  <block type="variables_get" id="=eo8X530,.gOZYjb-HM">
                    <field name="VAR">AAN</field>
                  </block>
                </value>
                <next>
                  <block type="inout_digital_write_var" id="{q}k}A([IL[TNl{5[E~5">
                    <value name="PIN">
                      <block type="variables_get" id="AX^N@59]P(u+SzP9,b}g">
                        <field name="VAR">LED3</field>
                      </block>
                    </value>
                    <value name="STATUS">
                      <block type="variables_get" id="6o[d8i{HSN.KDl{;l;lS">
                        <field name="VAR">AAN</field>
                      </block>
                    </value>
                    <next>
                      <block type="inout_digital_write_var" id="^pWM?o%iJNtpJ8,1cPhb">
                        <value name="PIN">
                          <block type="variables_get" id="xs0+gg5Fn35/,/sQuFTu">
                            <field name="VAR">LED4</field>
                          </block>
                        </value>
                        <value name="STATUS">
                          <block type="variables_get" id="nobV(aK0*evyR{Ly;c6N">
                            <field name="VAR">AAN</field>
                          </block>
                        </value>
                        <next>
                          <block type="inout_digital_write_var" id="V[w)W1Rr|~S+S43NRX.:">
                            <value name="PIN">
                              <block type="variables_get" id="e3-=VzA/#mGGMU2X3GN@">
                                <field name="VAR">LED5</field>
                              </block>
                            </value>
                            <value name="STATUS">
                              <block type="variables_get" id="#AZ}Ko|BKZr~)U?[GdW8">
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
  <block type="procedures_defnoreturn" id="64" x="13" y="563">
    <field name="NAME">EffectFlikker</field>
    <comment pinned="false" h="80" w="160">Describe this function...</comment>
    <statement name="STACK">
      <block type="controls_for" id="65">
        <field name="VAR">i</field>
        <value name="FROM">
          <block type="math_number" id="66">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="variables_get" id="67">
            <field name="VAR">FlikkerAantal</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number" id="68">
            <field name="NUM">1</field>
          </block>
        </value>
        <statement name="DO">
          <block type="procedures_callnoreturn" id="69">
            <mutation name="EffectAan"></mutation>
            <next>
              <block type="base_delay" id="70">
                <value name="DELAY_TIME">
                  <block type="variables_get" id="71">
                    <field name="VAR">FlikkerSnelheid</field>
                  </block>
                </value>
                <next>
                  <block type="procedures_callnoreturn" id="72">
                    <mutation name="EffectUit"></mutation>
                    <next>
                      <block type="base_delay" id="73">
                        <value name="DELAY_TIME">
                          <block type="variables_get" id="74">
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
