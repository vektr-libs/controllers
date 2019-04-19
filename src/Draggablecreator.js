function createDraggable(lib,modifierslib,mathlib,mylib){
  'use strict';
  function Sticky(draggable,decisionpercx,decisionpercy,boundingwindow){
    if(decisionpercx<0||decisionpercy<0){
      throw "Sticky's decision percentage cannot be <0";
    }
    this.draggable = draggable;
    this.initialBB = boundingwindow || this.draggable.boundingBox.get();
    this.decisionpercx = decisionpercx;
    this.decisionpercy = decisionpercy;
    this.animator = null;
    this.animatorDestroyedListener = null;
    this.draggableMovedListener = null;
  }
  Sticky.prototype.destroy = function(){
    this.detachMovedListener();
    this.set('animator',null);
    this.decisionpercy = null;
    this.decisionpercx = null;
    this.initialBB = null;
    this.draggable = null;
  };
  Sticky.prototype.set = lib.Settable.prototype.set;
  Sticky.prototype.detachMovedListener = function(){
    if(this.draggableMovedListener){
      this.draggableMovedListener.destroy();
    }
    this.draggableMovedListener = null;
  };
  Sticky.prototype.set_animator = function(val){
    if(this.animator){
      this.animatorDestroyedListener.destroy();
      this.animatorDestroyedListener = null;
      this.animator = null;
    }
    if(val && val.destroyed){
      this.animator = val;
      this.animatorDestroyedListener = this.animator.destroyed.attach(this.animatorDone.bind(this));
    }
  };
  Sticky.prototype.animatorDone = function(){
  	
    this.set('animator',null);
    //var isc = this.isStickyControllable();
    var isc = mathlib.boundingBoxesOverlap(this.draggable.boundingBox.get(), this.initialBB);
    this.draggable.set('enabled',isc);
    if(!isc){
      this.detachMovedListener();
      this.draggableMovedListener = this.draggable.attachListener('changed','boundingBox',this.onDraggableMoved.bind(this));
    }
  };
  Sticky.prototype.onDraggableMoved = function(){
    if(this.isStickyControllable()){
      this.detachMovedListener();
      this.draggable.set('enabled',true);
    }
  };
  Sticky.prototype.displacement = function(){
    var bb = this.draggable.boundingBox.get();
    return [this.initialBB[0]-bb[0],this.initialBB[1]-bb[1]];
  };
  Sticky.prototype.relativeDisplacement = function(){
    var d = this.displacement();
    return [d[0]/this.initialBB[2],d[1]/this.initialBB[3]];
  };
  Sticky.prototype.isStickyControllable = function(){
    var rd = this.relativeDisplacement();
    return this.decisionpercx>=Math.abs(rd[0]) && this.decisionpercy>=Math.abs(rd[1]);
  };
  Sticky.prototype.decide = function(){
    if(this.animator){
      return;
    }
    var bb = this.draggable.get('boundingBox'),
      dx = this.initialBB[0]-bb[0], adx = Math.abs(dx), sdx = dx>0?1:-1,
      dy = this.initialBB[1]-bb[1], ady = Math.abs(dy), sdy = dy>0?1:-1,
      totalpath,trajectory,direction;

    if (adx<0.01 && ady<0.01) {
      return;
    }
    this.draggable.set('enabled',false);
    if(adx>=0.01){
      direction = 'tx';
      totalpath = this.initialBB[0];
      if(adx>bb[2]*this.decisionpercx){
        trajectory = bb[0]+sdx*bb[2];
      }else{
        trajectory = bb[0];
      }
    }else if(ady>=0.01){
      direction = 'ty';
      totalpath = this.initialBB[1];
      if(ady>bb[3]*this.decisionpercy){
        trajectory = bb[1]+sdy*bb[3];
      }else{
        trajectory = bb[1];
      }
    }
    var po = {};
    po[direction] = {amount:totalpath-trajectory};
    var s = this.draggable.moveEvaluator.speed||1;
    var dur = Math.abs(totalpath-trajectory)/s;//200;
    if(dur>300){
      dur=300;
    }
    this.set('animator',new modifierslib.Animator(this.draggable.el,{
      duration:dur,
      props:po
    }));
  };

  function Draggable(controller,path,hotspot){
    mylib.DragAware.call(this, controller, path, hotspot);
    this.sticky = null;
  }
  lib.inherit(Draggable,mylib.DragAware);
  Draggable.prototype.__cleanUp = function(){
    this.sticky = null;
    mylib.DragAware.prototype.__cleanUp.call(this);
  };
  Draggable.prototype.set_sticky = function(val){
    if(this.sticky){
      this.sticky.set('decisionpercx',val.decisionpercx);
      this.sticky.set('decisionpercy',val.decisionpercy);
    }
    this.sticky = val;
  };
  Draggable.prototype.moveBy = function(dx,dy){
    if(this.dragged){return;}
    this.el.moveBy(dx,dy);
  };
  Draggable.prototype.handleDrag = function (dx, dy) {
    this.el.moveBy(dx, dy);
  };
  Draggable.prototype.update_loc = lib.dummyFunc;

  Draggable.prototype.goSticky = function(decisionpercx,decisionpercy,boundingwindow){
    this.set('sticky',new Sticky(this,decisionpercx,decisionpercy,boundingwindow));
  };
  Draggable.prototype.onDragEnd = function () {
    mylib.DragAware.prototype.onDragEnd.apply(this, arguments);
    if(this.sticky){
      this.sticky.decide();
    }
  };
  mylib.Draggable = Draggable;
}

module.exports = createDraggable;
