function createModalStandalone(lib, mylib) {
  'use strict';

  var Standalone = mylib.Standalone;

  //In order to make this thing work, it has to be LAST layer on the screen meaning that it will be the first hit with the mouse click DOM event ... otherwise it simply won't work ...
  function ModalStandalone (controller, path, scene, layerindex) {
    Standalone.call(this, controller, path, scene, layerindex);
    var layer = this.svgEl().__parent;
    layer.preventMousePropagation = true;
    this._ms_layer = layer;
  }
  lib.inherit(ModalStandalone, Standalone);
  ModalStandalone.prototype.__cleanUp = function () {
    this._ms_layer = null;
    Standalone.prototype.__cleanUp.call(this);
  };

  ModalStandalone.prototype.show = function () {
    this._ms_layer.set('user_display', true);
    Standalone.prototype.show.call(this);
  };

  ModalStandalone.prototype.hide = function () {
    this._ms_layer.set('user_display', false);
    Standalone.prototype.hide.call(this);
  };

  mylib.ModalStandalone = ModalStandalone;
}

module.exports = createModalStandalone;
