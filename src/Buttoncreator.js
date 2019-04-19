function createButton(lib,mylib){
  'use strict';
  var Controller = mylib.Controller;

/**
* Creates a button on a given element. Every button must have four states (enabled, hovered, pressed and disabled) and a hotspot that defines the area that the button occupies.
* @constructor Button
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
* @param {Boolean} enabled - Button state (enabled or disabled)
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
*/
  function Button(controller,path,enabled,clickcb, lpcb){
    Controller.call(this,controller,path);
    this.hotspot = new mylib.Mouse(this,[this.el.hotspotChildId()]);
    this.hotspot.attachListener('mousein',this.onMouseIn.bind(this));
    this.hotspot.attachListener('mouseout',this.onMouseOut.bind(this));
    this.hotspot.attachListener('mousepressed',this.onMousePressed.bind(this));
    this.hotspot.attachListener('clicked',this.onMouseClicked.bind(this));
    this.hotspot.attachListener('longpress', this.onLongPress.bind(this));
    this.clickcb = 'function'===typeof clickcb ? clickcb : null;
    this.lpcb = 'function' === typeof lpcb ? lpcb : null;
    this.subelnames = [];
    this.hovered = null;
    this.enabled = null;
    this.disabled = null;
    this.pressed = null;
    this.state = 'idle';
    this.registerSubEl('hovered');
    this.registerSubEl('enabled');
    this.registerSubEl('disabled');
    this.registerSubEl('pressed');
    this.isEnabled = enabled;
    this.show();
  }
  lib.inherit(Button,Controller);
  Button.prototype.set = lib.Changeable.prototype.set;

/**
* Gets the element in SVG that represents a button state 
* by the given suffix (enabled, hovered, pressed or disabled).
* If such state exists, it is pushed in an array of button state elements.
* @method registerSubEl
* @param {String} idsuffix - Suffix that defines the button state (enabled, hovered, pressed, disabled)
* @instance
* @memberof Button
*/
  Button.prototype.registerSubEl = function(idsuffix,elname){
    var id = this.el.id+'_'+idsuffix;
    var ch = this.el.childById(id);
    if(ch){
      this[idsuffix] = ch;
      this.subelnames.push(idsuffix);
    }
  };

/**
* Shows the element that represents a button state, if such button state exists,
* i.e. if it is registered for the Button element.
* @method showSubEl
* @param {String} targetsuffix -  Suffix (button state) of the element that should be shown.
* @param {String} subelidsuffix - Suffix (button state) from the array of registered 
* button states for the Button object.
* @instance
* @memberof Button
*/
  Button.prototype.showSubEl = function(targetsuffix,subelidsuffix){
    var subel = this[subelidsuffix];
    if(targetsuffix===subelidsuffix){
      //console.log(this.id,'showing',targetsuffix);
      subel.show();
    }else{
      subel.hide();
    }
  };

/**
* Returns the current button state if Button is enabled. 
* Otherwise it returns the 'disabled' state of the Button.
* @method suffixForState
* @instance
* @memberof Button
* @returns {String} Button state (suffix) - enabled, hovered, pressed or disabled
*/
  Button.prototype.suffixForState = function(){
    switch(this.state){
      case 'idle':
        return this.isEnabled ? 'enabled' : 'disabled';
      case 'hovered':
        return this.isEnabled ? 'hovered' : 'disabled';
      case 'pressed':
        return this.isEnabled ? 'pressed' : 'disabled';
    }
  };

/**
* Sets the button state that should be shown, unless the Button is disabled. 
* @method set_state
* @param {String} state - Button state that you want to show (suffix) - enabled, hovered, pressed or disabled.
* @instance
* @memberof Button
*/
  Button.prototype.set_state = function(state){
    this.state = state;
    if(!this.isEnabled){
      return false;
    }
    this.show();
  };

/**
* Shows the Button object with it's current state. 
* @method show
* @instance
* @memberof Button
*/
  Button.prototype.show = function(){
    var idsuffix = this.suffixForState();
    //console.log('Button showing',idsuffix);
    this.subelnames.forEach (this.showSubEl.bind(this,idsuffix));
    Controller.prototype.show.call(this);
  };

/**
* Changes the Button state to 'hovered'. 
* @method onMouseIn 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseIn = function(){
    if(this.isEnabled){
      this.set('state','hovered');
    }
  };

/**
* Changes the Button state to 'idle'. 
* @method onMouseOut 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseOut = function(){
    if(this.isEnabled){
      this.set('state','idle');
    }
  };

/**
* Changes the Button state to 'pressed'. 
* @method onMousePressed 
* @instance
* @memberof Button
*/
  Button.prototype.onMousePressed = function(){
    if(this.isEnabled){
      this.set('state','pressed');
    }
  };

/**
* Returns the Button state - 'hovered' or 'idle' -
* depending on whether the cursor is placed over the Button element.
* @method clickedState 
* @instance
* @memberof Button
* @returns {String} Button state - 'hovered' or 'idle'
*/
  Button.prototype.clickedState = function(){
    return this.hotspot.hovered?'hovered':'idle';
  };

/**
* Executes the callback function when the Button is clicked.
* @method onMouseClicked 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseClicked = function(){
    this._doCB(this.clickcb);
  };

/**
* Executes the callback function when the Button is long pressed.
* @method onLongPress 
* @instance
* @memberof Button
*/
  Button.prototype.onLongPress = function () {
    this._doCB(this.lpcb);
  };

/**
* Executes the given callback function when the Button is pressed.
* @method _doCB 
* @param {Function} cb - Callback function to execute on button press.
* @instance
* @private
* @memberof Button
*/
  Button.prototype._doCB = function(cb) {
    if(this.isEnabled && this.get('state') === 'pressed'){
      this.set('state',this.clickedState());
      if(cb){
        cb(this);
      }
    }
  };

/**
* Cleans up and removes all properties of a Button Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof Button
*/
  Button.prototype.__cleanUp = function(){
    this.lpcb = null;
    this.isEnabled = null;
    this.state = null;
    this.pressed = null;
    this.disabled = null;
    this.enabled = null;
    this.hovered = null;
    this.subelnames = null;
    this.clickcb = null;
    this.hotspot.destroy();
    this.hotspot = null;
    this.id = null;
    Controller.prototype.__cleanUp.call(this);
  };

/**
* Returns whether the Button is enabled or not.
* @method get_enabled 
* @instance
* @memberof Button
* @returns {Boolean}
*/
  Button.prototype.get_enabled = function(){
    return this.isEnabled;
  };

/**
* Sets the Button state to enabled and shoes the Button.
* @method set_enabled 
* @instance
* @memberof Button
*/
  Button.prototype.set_enabled = function(val){
    this.isEnabled = val;
    this.show();
  };

/**
* Sets the 'enabled' Button property to true.
* @method enable 
* @instance
* @memberof Button
*/
  Button.prototype.enable = function(){
    this.set('enabled',true);
  };

/**
* Sets the 'enabled' Button property to false.
* @method disable 
* @instance
* @memberof Button
*/
  Button.prototype.disable = function(){
    this.set('enabled',false);
  };

  function nextChild(obj,pathel){
    obj.el = obj.el.childById(pathel);
  }

/**
* Creates a Button on a given element that is a USE instance of a group representing a button (that has four states (enabled, hovered, pressed and disabled) and a hotspot that defines the area that the button occupies).
* @constructor UseButton
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
* @param {Boolean} enabled - Button state (enabled or disabled)
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
*/
  function UseButton (controller, path, enabled, clickcb, lpcb) {
    Controller.call(this, controller, path);
    this.enabled = enabled;
    this._use_button = null;
    this.get('el').tearOffUse(this._ub_onCreated.bind(this, clickcb, lpcb));
  }

  lib.inherit(UseButton, Controller);

/**
* Cleans up and removes all properties of a UseButton Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof UseButton
*/
  UseButton.prototype.__cleanUp = function () {
    this.enabled = null;
    if (this._use_button) this._use_button.destroy();
    this._use_button = null;
    Controller.prototype.__cleanUp.call(this);
  };

/**
* Creates an instance of a {@link Button} on a given element 
* and sets it to '_use_button' property of UseButton.
* @method _ub_onCreated
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
* @param {object} group - Group instance 
* @instance
* @private
* @memberof UseButton
*/
  UseButton.prototype._ub_onCreated = function (clickcb, lpcb, group){
    if (!this.destroyed) return;
    group.show();
    this.set('_use_button', new Button(this, [group.get('id')], this.get('enabled'), clickcb, lpcb));
  };

/**
* Returns the value of the 'enabled' property of UseButton.
* @method get_enabled
* @instance
* @memberof UseButton
*/
  UseButton.prototype.get_enabled = function () {
    return this.enabled;
  };

/**
* Sets the UseButton 'enabled' property to true or false.
* @method set_enabled
* @param {Boolean} val - Button state enabled or not
* @instance
* @memberof UseButton
*/
  UseButton.prototype.set_enabled = function (val) {
    this.enabled = val;
    if (this._use_button) this._use_button.set('enabled', val);
  };

/**
* Sets the UseButton 'enabled' property to true.
* @method enable
* @instance
* @memberof UseButton
*/
  UseButton.prototype.enable = function () {
    this.set('enabled', true);
  };

/**
* Sets the UseButton 'enabled' property to false.
* @method disable
* @instance
* @memberof UseButton
*/
  UseButton.prototype.disable = function () {
    this.set('enabled', false);
  };


  ///use this type of button for patterns like: i have a background which is use, and something above which is button label
  function BackgroundButton (controller, path, enabled, clickcb, lpcb, backgroundid) {
    Controller.call(this, controller, path);
    this._button = null;
    this.disabled = !enabled;
    var el = this.get('el');

    var chld = backgroundid ? el.childAtPath(backgroundid) : el.childAtPath('{BACKGROUND}_background', {BACKGROUND: this.get('el').get('id')});
    if (!chld) return;
    chld.tearOffUse(this._onBckgReady.bind(this, chld, clickcb, lpcb));

  }
  lib.inherit(BackgroundButton, Controller);

  BackgroundButton.prototype.__cleanUp = function () {
    this.disabled = null;
    if (this._button) this._button.destroy();
    this._button = null;
    Controller.prototype.__cleanUp.call(this);
  };

  BackgroundButton.prototype._onBckgReady = function (chld, clickcb, lpcb, el) {
    el.show();
    this._button = new Button(this, [child.get('id'), el.get('id')], !this.disabled, clickcb, lpcb);
  };

  BackgroundButton.prototype.show = function () {
    if (this._button) this._button.show();
    Controller.prototype.show.call(this);
  };

  BackgroundButton.prototype.hide = function () {
    if (this._button) this._button.hide();
    Controller.prototype.hide.call(this);
  };

  BackgroundButton.prototype.get_enabled = function () {return !this.disabled;};

  BackgroundButton.prototype.set_enabled = function (val) {
    this.disabled = !val;
    if (this._button) this._button.set('enabled', val);
  };

  BackgroundButton.prototype.enable = function () {
    this.set('enabled', true);
  };

  BackgroundButton.prototype.disable = function () {
    this.set('enabled', false);
  };

  mylib.Button = Button;
  mylib.UseButton = UseButton;
  mylib.BackgroundButton = BackgroundButton;
}

module.exports = createButton;
