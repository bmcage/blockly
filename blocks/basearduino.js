/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Fred Lin.
 * https://github.com/gasolin/BlocklyDuino
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Arduino blocks.
 * @author gasolin@gmail.com (Fred Lin)
 */
'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.base');

goog.require('Blockly.Blocks');


Blockly.Blocks['base_delay'] = {
  helpUrl: 'http://arduino.cc/en/Reference/delay',
  init: function() {
    this.setColour(120);
    this.appendValueInput("DELAY_TIME", 'Number')
        .appendField(Blockly.Msg.ARD_DELAY)
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_DELAY_TIP);
  }
};

Blockly.Blocks['base_millis'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/Millis',
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_MILLIS)
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.ARD_MILLIS_TIP);
  }
};

Blockly.Blocks['base_map'] = {
  helpUrl: 'http://arduino.cc/en/Reference/map',
  init: function() {
    this.setColour(230);
    this.appendValueInput("NUM", 'Number')
        .appendField(Blockly.Msg.ARD_MAP)
        .setCheck('Number');
    this.appendValueInput("DMAX", 'Number')
        .appendField(Blockly.Msg.ARD_MAP_VAL)
        .setCheck('Number');
    this.appendDummyInput()
	      .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.ARD_MAP_TIP);
  }
};

Blockly.Blocks['inout_buildin_led'] = {
   helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
   init: function() {
     this.setColour(190);
     this.appendDummyInput()
	       .appendField(Blockly.Msg.ARD_BUILDIN_LED)
	       .appendField(new Blockly.FieldDropdown([[Blockly.Msg.ARD_HIGH, "HIGH"], [Blockly.Msg.ARD_LOW, "LOW"]]), "STAT");
     this.setPreviousStatement(true, null);
     this.setNextStatement(true, null);
     this.setTooltip(Blockly.Msg.ARD_BUILDIN_LED_TIP);
   }
};

Blockly.Blocks['inout_digital_write'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
	      .appendField(Blockly.Msg.ARD_DIGITALWRITE)
	      .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
      	.appendField(Blockly.Msg.ARD_DIGITALWRITE_STATUS)
      	.appendField(new Blockly.FieldDropdown([[Blockly.Msg.ARD_HIGH, "HIGH"], [Blockly.Msg.ARD_LOW, "LOW"]]), "STAT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_DIGITALWRITE_TIP);
  }
};

Blockly.Blocks['inout_digital_write_var'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
  init: function() {
    this.setColour(230);
    this.appendValueInput("PIN", 'Number')
        .appendField(Blockly.Msg.ARD_DIGITALWRITE)
        .setCheck('Number');
    this.appendValueInput("STATUS", 'Number')
        .appendField(Blockly.Msg.ARD_DIGITALWRITE_STATUS)
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_DIGITALWRITEVAR_TIP);
  }
};

Blockly.Blocks['inout_digital_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalRead',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
	      .appendField(Blockly.Msg.ARD_DIGITALREAD)
	      .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.setOutput(true, 'Boolean');
    this.setTooltip(Blockly.Msg.ARD_DIGITALREAD_TIP);
  }
};

Blockly.Blocks['inout_analog_write'] = {
  helpUrl: 'http://arduino.cc/en/Reference/AnalogWrite',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_ANALOGWRITE)
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendValueInput("NUM", 'Number')
        .appendField(Blockly.Msg.ARD_VALUE)
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_ANALOGWRITE_TIP);
  }
};

Blockly.Blocks['inout_analog_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/AnalogRead',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_ANALOGREAD)
        .appendField(new Blockly.FieldDropdown(profile.default.analog), "PIN");
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.ARD_ANALOGREAD_TIP);
  }
};

Blockly.Blocks['inout_tone'] = {
  helpUrl: 'http://www.arduino.cc/en/Reference/Tone',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TONE_PIN)
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_TONE_FREQ)
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_TONE_PIN_TIP);
  }
};

Blockly.Blocks['inout_notone'] = {
  helpUrl: 'http://www.arduino.cc/en/Reference/NoTone',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_NOTONE_PIN)
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_NOTONE_PIN_TIP);
  }
};

Blockly.Blocks['inout_highlow'] = {
  helpUrl: 'http://arduino.cc/en/Reference/Constants',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.ARD_HIGH, "HIGH"], [Blockly.Msg.ARD_LOW, "LOW"]]), 'BOOL')
    this.setOutput(true, 'Boolean');
    this.setTooltip('');
  }
};

//servo block
//http://www.seeedstudio.com/depot/emax-9g-es08a-high-sensitive-mini-servo-p-760.html?cPath=170_171
Blockly.Blocks['servo_move'] = {
  helpUrl: 'http://www.arduino.cc/playground/ComponentLib/servo',
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("Servo")
        .appendField(new Blockly.FieldImage("http://www.seeedstudio.com/depot/images/product/a991.jpg", 64, 64))
        .appendField("PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
    this.appendValueInput("DEGREE", 'Number')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_READ_DEG_180);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_READ_DEG_180_TIP);
  }
};

Blockly.Blocks['servo_read_degrees'] = {
  helpUrl: 'http://www.arduino.cc/playground/ComponentLib/servo',
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("Servo")
        .appendField(new Blockly.FieldImage("http://www.seeedstudio.com/depot/images/product/a991.jpg", 64, 64))
        .appendField("PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_READ_DEG)
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.ARD_READ_DEG_TIP);
  }
};

Blockly.Blocks['serial_print'] = {
  helpUrl: 'http://www.arduino.cc/en/Serial/Print',
  init: function() {
    this.setColour(230);
    this.appendValueInput("CONTENT", 'String')
        .appendField(Blockly.Msg.ARD_SERIAL_PRINT);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_SERIAL_PRINT_TIP);
  }
};

Blockly.Blocks['declare_var'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/Int',
  init: function() {
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput("NAME", 'String')
        .appendField(Blockly.Msg.ARD_DEFINE)
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_AS_INTEGER_NUMBER)
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_AS_INTEGER_NUMBER_TIP);
  }
};

Blockly.Blocks['declare_var_float'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/Float',
  init: function() {
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput("NAME", 'String')
        .appendField(Blockly.Msg.ARD_DEFINE)
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_AS_FLOAT_NUMBER)
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_AS_FLOAT_NUMBER_TIP);
  }
};

Blockly.Blocks['declare_var_long'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/Long',
  init: function() {
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput("NAME", 'String')
        .appendField(Blockly.Msg.ARD_DEFINE)
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_AS_LONG_NUMBER)
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_AS_LONG_NUMBER_TIP);
  }
};

Blockly.Blocks['declare_var_uint'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/UnsignedInt',
  init: function() {
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput("NAME", 'String')
        .appendField(Blockly.Msg.ARD_DEFINE)
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_AS_UINT_NUMBER )
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_AS_UINT_NUMBER_TIP);
  }
};

Blockly.Blocks['declare_var_ulong'] = {
  helpUrl: 'https://www.arduino.cc/en/Reference/UnsignedLong',
  init: function() {
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput("NAME", 'String')
        .appendField(Blockly.Msg.ARD_DEFINE)
    this.appendValueInput("NUM", "Number")
        .appendField(Blockly.Msg.ARD_AS_ULONG_NUMBER)
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_AS_ULONG_NUMBER_TIP);
  }
};