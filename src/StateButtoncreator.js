function createStateButton(lib, renderinglib, mylib) {
  'use strict';
  var Controller = mylib.Controller, 
    Button = mylib.Button, 
    UseButton = mylib.UseButton;

  function StateButton (controller, path, states, default_state) {
    Controller.call(this, controller, path);
    this.state = null;
    this.buttons = {};
    this.disabled_states = [];
    lib.traverse(states, this._createButtons.bind(this));
    if (default_state) {
      this.set('state', default_state);
    }else{
      this.enableAll();
    }
  }
  lib.inherit(StateButton, Controller);
  StateButton.prototype.__cleanUp = function () {
    lib.arryNullAll(this.disabled_states);
    this.disabled_states = null;
    lib.objDestroyAll(this.buttons);
    this.buttons = null;
    this.state = null;
    Controller.prototype.__cleanUp.call(this);
  };

  StateButton.prototype._onButtonsReady = function (results) {
   };

  StateButton.prototype._createButtons = function (path, state) {
    var el = this.get('el').childAtPath(path),
      ctor = (el instanceof renderinglib.Use) ? UseButton : Button;
    this.buttons[state] = new ctor(this, path.split('.'), true, this.set.bind(this, 'state', state));
  };

  StateButton.prototype.set_state = function (state) {
    this.state = state;
    var current = this.buttons[this.state];
    this.enableAll();
    this._do_enable(false, current);
  };

  StateButton.prototype.disableAll = function () {
    lib.traverse(this.buttons, this._do_enable.bind(this, false));
  };

  StateButton.prototype.enableAll = function () {
    lib.traverse(this.buttons, this._do_enable.bind(this, true));
  };

  StateButton.prototype._do_enable = function (enabled, button, state){
    if (!button) return;
    button.set('enabled', this.isStateDisabled(state) ? false : enabled);
    var bckg = button.get('el').childAtPath(button.get('el').get('id')+'_active_bg');
    if (!bckg) return;
    bckg.set('display', !enabled);
  };

  StateButton.prototype.getStateButton = function (state) {
    return this.buttons && state in this.buttons ? this.buttons[state] : null;
  };

  StateButton.prototype.isStateDisabled = function (state) {
    return this.disabled_states.indexOf(state) >= 0;
  };

  StateButton.prototype.enableState = function (state) {
    var index = this.disabled_states.indexOf(state);
    if (index < 0) return;
    this.disabled_states.splice(index, 1);
    this.getStateButton(state).disable();
  };

  StateButton.prototype.disableState = function (state) {
    if (!this.isStateDisabled(state)) {
      this.disabled_states.push(state);
      this.set_state(this.get('state'));
    }
  };

  function UseStateButton (controller, path, states, default_state) {
    Controller.call(this, path);
    this._usb = null;
    this._usb_state = default_state;
    this.get('el').tearOffUse(this._usb_onTearDone.bind(this, states, default_state));
  }
  lib.inherit(UseStateButton, Controller);
  UseStateButton.prototype.__cleanUp = function () {
    this._usb_state = null;
    if (this._usb) this._usb.destroy();
    this._usb = null;
    Controller.prototype.__cleanUp.call(this);
  };

  UseStateButton.prototype._usb_onTearDone = function (states, ds, el) {
    el.show();
    this.set('_usb', new StateButton(this, [el.get('id')], states, ds));
    this._usb.set('state', this._usb_state);
  };

  UseStateButton.prototype.disableAll = function () {
    if(this._usb) this._usb.disableAll();
  };

  UseStateButton.prototype.enableAll = function () {
    if (this._usb) this._usb.enableAll();
  };


  UseStateButton.prototype.getStateButton = function (state) {
    return this._usb ? this._usb.getStateButton(state) : null;
  };
  UseStateButton.prototype.get_state = function () {
    return this._usb_state;
  };

  UseStateButton.prototype.set_state = function (val) {
    this._usb_state = val;
    if (!this._usb) return;
    this._usb.set('state', val);
  };

  mylib.StateButton = StateButton;
  mylib.UseStateButton = UseStateButton;
}

module.exports = createStateButton;
