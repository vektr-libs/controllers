function createToggleButton(lib, mylib) {
  'use strict';
  var Controller = mylib.Controller;

  function setButt (tbinstance, initial_state, path, state) {
    switch (state) {
      case 'on':
        tbinstance.onbutt = new mylib.Button(tbinstance, path, initial_state=='off', tbinstance.onToggle.bind(tbinstance, true));
        break;
      case 'off':
        tbinstance.offbutt = new mylib.Button(tbinstance, path, initial_state=='on', tbinstance.onToggle.bind(tbinstance, false));
        break;
      default:
        throw new lib.Error('INVALID_STATE_IN_PATHS', 'The only valid properties of the "paths" Object are `on` and `off`');
    }
  }

  function ToggleButton (controller, path, enabled, paths, clickcb, state) {
    if (!paths && 'on' in paths && 'off' in paths) {
      throw new lib.Error('INVALID_PATHS_STRUCTURE', "paths must be an Object with a Button path mapped to `on` and a Button path mapped to `off`");
    }
    Controller.call(this,controller,path);
    this.onbutt = null;
    this.offbutt = null;
    this.clickcb = clickcb;
    this.value = (state === 'on' ? true : (state === 'off' ? false : null));
    this.enabled = enabled;
    lib.traverseShallow(paths, setButt.bind(null, this, state));
    this.set('enabled', enabled);
  }
  lib.inherit(ToggleButton, Controller);
  ToggleButton.prototype.set = lib.Changeable.prototype.set;
  ToggleButton.prototype.destroy = function () {
    this.value = null;
    this.clickcb = null;
    if (this.offbutt) {
      this.offbutt.destroy();
    }
    this.offbutt = null;
    if (this.onbutt) {
      this.onbutt.destroy();
    }
    this.onbutt = null;
    Controller.prototype.destroy.call(this);
  };
  ToggleButton.prototype.onToggle = function (ison) {
    if (!(this.onbutt && this.offbutt)) {
      return;
    }
    this.onbutt.set('enabled', !ison);
    this.offbutt.set('enabled', ison);
    this.value = ison;
    if (this.clickcb) {
      this.clickcb(ison);
    }
  };
  ToggleButton.prototype.set_enabled = function (enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.onbutt.set('enabled', false);
      this.onbutt.set('enabled', false);
      return;
    }
    if (this.value === true) {
      this.onbutt.set('enabled', false);
      this.offbutt.set('enabled', true);
      return;
    }
    if (this.value === false) {
      this.onbutt.set('enabled', true);
      this.offbutt.set('enabled', false);
      return;
    }
    this.onbutt.set('enabled', false);
    this.onbutt.set('enabled', false);
  };
  ToggleButton.prototype.onMousePressed = function () {
    var butt = this.actualButton();
    if (butt) {
      butt.onMousePressed.apply(butt, arguments);
    }
  };
  ToggleButton.prototype.onMouseClicked = function () {
    var butt = this.actualButton();
    if (butt) {
      butt.onMouseClicked.apply(butt, arguments);
    }
  };
  ToggleButton.prototype.actualButton = function () {
    if (this.value === true) {
      return this.offbutt;
    }
    if (this.value === false) {
      return this.onbutt;
    }
    return null;
  };

  mylib.ToggleButton = ToggleButton;
}

module.exports = createToggleButton;
