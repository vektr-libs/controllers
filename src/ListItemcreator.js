function createListItem(lib,mathlib,mylib){
  'use strict';
  function ListItem(ctrl,path){
    this.link = null;
    this.container = null;
    mylib.HotspotAware.call(this,ctrl,path);
    this.test_id = null;
  }
  lib.inherit(ListItem,mylib.HotspotAware);
  ListItem.prototype.__cleanUp = function(){
    if (this.container) {
      this.container.removeItem(this);
    }
    this.container = null;
    this.link = null;
    mylib.HotspotAware.prototype.__cleanUp.call(this);
  };

  ListItem.prototype.moveBy = function(dx,dy){
    if (dx instanceof Array) {
      dy = dx[1];
      dx = dx[0];
    }
    this.el.moveBy(dx,dy);
    this.checkVisibility();
  };

  ListItem.prototype.checkVisibility = function () {
    if (!this.container) return;
    if(this.container.boundingBox && 'function' === typeof this.container.boundingBox.get){
      var disp = mathlib.boundingBoxesOverlap(this.boundingBox.get(),this.container.boundingBox.get());
      this.el.set('display',disp);
    }
  };

  ListItem.prototype.containerOnPosition = lib.dummyFunc;
  mylib.ListItem = ListItem;
}

module.exports = createListItem;
