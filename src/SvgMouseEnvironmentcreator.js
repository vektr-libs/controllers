function createSvgMouseEnvironment(lib,hierarchymixinslib,mylib){
  'use strict';
  function SvgMouseEnvironment(svg){
    this.svg = svg;
    mylib.ChildMouseEnvironment.call(this);
    hierarchymixinslib.Child.call(this);
    lib.Listenable.call(this);
    this.active = this.svg.get('display');
    this.svgListener = this.svg.attachListener('changed','display',this.setActive.bind(this));
  }
  lib.inherit(SvgMouseEnvironment,mylib.ChildMouseEnvironment);
  SvgMouseEnvironment.prototype.setActive = function(val){
    this.active = val;
  };
  SvgMouseEnvironment.prototype.syntheticEvent = function(evnt){
    var tm = this.svg.transformMatrix, s = this.svg.scale;
    return this.svg.checkIfVisible() && [(evnt[0]-tm[4])/tm[0]/s,(evnt[1]-tm[5])/tm[3]/s];
  };
  SvgMouseEnvironment.prototype.mouseMoved = function(evnt){ //evnt is the point prepared by MouseEnvironment
    return this.svg.checkIfVisible() && this.moved(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.mouseDown = function(evnt){
    return this.svg.checkIfVisible() && this.down(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.touch = function(evnt){
    return this.svg.checkIfVisible() && this.touched(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.untouch = function(evnt){
    return this.svg.checkIfVisible() && this.untouched();
  };
  SvgMouseEnvironment.prototype.mouseUp = function(){
    return this.svg.checkIfVisible() && this.up();
  };
  SvgMouseEnvironment.prototype.onLongpress = function () {
    return this.svg.checkIfVisible() && this.longpress();
  };

  SvgMouseEnvironment.prototype.attachListener = lib.Listenable.prototype.attachListener;
  SvgMouseEnvironment.prototype.__cleanUp = function(){
    this.svgListener.destroy();
    this.svgListener = null;
    this.active = null;
    lib.Listenable.prototype.__cleanUp.call(this);
    hierarchymixinslib.Child.prototype.__cleanUp.call(this);
    mylib.ChildMouseEnvironment.prototype.__cleanUp.call(this);
    this.svg = null;
  };
  mylib.SvgMouseEnvironment = SvgMouseEnvironment;
}

module.exports = createSvgMouseEnvironment;
