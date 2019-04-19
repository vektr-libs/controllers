function createHotspotAware(lib,mylib){
  'use strict';
  function HotspotAware(ctrl,path,hotspotctor){
    mylib.Controller.call(this,ctrl,path);
    var ctor = hotspotctor || mylib.AreaAware;
    this.hotspot = new ctor(this,[this.el.hotspotChildId()]);
    this.hotspotDestroyedListener = this.hotspot.destroyed.attach(this.hotspotDestroyed.bind(this));
    this.boundingBox = this.hotspot.boundingBox;
  }
  lib.inherit(HotspotAware,mylib.Controller);
  //debugging purposes only
  HotspotAware.prototype.hotspotDestroyed = function(){
    console.trace();
    console.log('hotspot destroyed on HotspotAware without notice');
    this.hotspotDestroyedListener.destroy();
    this.hotspotDestroyedListener = null;
    this.destroy();
  };
  HotspotAware.prototype.__cleanUp = function(){
    if(this.hotspotDestroyedListener){
      this.hotspotDestroyedListener.destroy();
    }
    this.hotspotDestroyedListener = null;
    this.boundingBox = null;
    this.hotspot.destroy();
    this.hotspot = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  mylib.HotspotAware = HotspotAware;
}

module.exports = createHotspotAware;
