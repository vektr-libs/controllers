function createMouse(lib,commonlib,mathlib,renderinglib,mylib){
  'use strict';
  function InverseMatrixProperty(neededtargetnames){
    commonlib.LazyListener.call(this,neededtargetnames);
  }
  lib.inherit(InverseMatrixProperty,commonlib.LazyListener);
  InverseMatrixProperty.prototype.calculateValue = function(){
    return mathlib.inverseMatrix(this.targets.transformMatrix.get());
  };

  function Mouse(controller,path){
    this.lastknownpos = [0,0];
    this.hovered = false;
    this.pressed = false;
    mylib.AreaAware.call(this,controller,path);
    this.searchMatrix = new InverseMatrixProperty(['transformMatrix']);
    this.searchMatrix.add('transformMatrix',this.transformMatrix);
    this.mousein = new lib.HookCollection();
    this.mouseout = new lib.HookCollection();
    this.mousepressed = new lib.HookCollection();
    this.mousedragged = new lib.HookCollection();
    this.clicked = new lib.HookCollection();
    this.longpress = new lib.HookCollection();
    this.mouseEnvironment = null;
    this.attachToMouseEnvironment();
    //this.svgEl().mouseEnvironment.addChild(this);
  }
  lib.inherit(Mouse,mylib.AreaAware);
  Mouse.prototype.__cleanUp = function(){
    this.longpress.destruct();
    this.longpress = null;
    this.clicked.destruct();
    this.mouseEnvironment = null;
    this.clicked = null;
    this.mousepressed.destruct();
    this.mousepressed = null;
    this.mouseout.destruct();
    this.mouseout = null;
    this.mousein.destruct();
    this.mousein = null;
    this.mousedragged.destruct();
    this.mousedragged = null;
    this.searchMatrix.destroy();
    this.searchMatrix = null;
    mylib.AreaAware.prototype.__cleanUp.call(this);
    this.pressed = null;
    this.lastknownpos = null;
    this.hovered = null;
  };

  function nextPossibleMouseEnvironmentContainer(e){
    if(e.active && e.active.stack && e.active.stack[0]){
      return e.active.stack[0];
    }
    if(e.__parent instanceof renderinglib.SvgLayer){
      return e.__parent;
    }
  }

  Mouse.prototype.onActiveChanged = function (val) {
    mylib.Controller.prototype.onActiveChanged.apply(this, arguments);
    if (val) {
      if (this.hovered || this.pressed) {
        this.mouseMoved(this.mouseEnvironment.lastpos);
      }
    }
  };
  Mouse.prototype.mouseEnvironmentContainer = function(){
    var e = this.active.stack[0];
    while(e){
      if(e.mouseEnvironment){
        return e;
      }
      e = nextPossibleMouseEnvironmentContainer(e);
    }
  };
  Mouse.prototype.attachToMouseEnvironment = function(){
    var mec = this.mouseEnvironmentContainer();
    if(mec){
      mec.mouseEnvironment.addChild(this);
    }else{
      throw this.id+' did not find a mouseEnvironment in its active stack';
    }
    this.mouseEnvironment = mec.mouseEnvironment;
  };
  Mouse.prototype.doFire = function(evntname){
    var evnt = this[evntname];
    if(!(evnt && evnt.fire)){
      return;
    }
    //lib.runNext(evnt.fire.bind(evnt));
    evnt.fire();
  };
  Mouse.prototype.mouseMoved = function(point){ //synthetic svg mouse environment prepared the point
    if(this.pressed){
      this.lastknownpos = this.capturedPoint(point);
      this.doFire('mousedragged');
      return true;
      //this.mousedragged.fire();
    }else{
      return this.mouseMovedIndifferent(point);
    }
  };
  Mouse.prototype.mouseMovedIndifferent = function(point){
    var contains = this.containsPointFromEvent(point);
    if(contains){
      if(!this.hovered){
        this.hovered = true;
        this.doFire('mousein');
        //this.mousein.fire();
      }
      return true;
    }else{
      if(this.hovered){
        this.hovered = false;
        this.doFire('mouseout');
        //this.mouseout.fire();
        return true;
      }else{
        return false;
      }
    }
  };
  Mouse.prototype.set_pressed = function(val){
    this.pressed = val;
    if(val){
      this.doFire('mousepressed');
      //this.mousepressed.fire();
    }else{
      this.doFire('clicked');
      //this.clicked.fire();
    }
  };
  Mouse.prototype.mouseDown = function(point){
    /*
    if(this.hovered){
      this.set('pressed',true);
      return true;
    }
    */
    if(this.containsPointFromEvent(point)){
      this.set('pressed',true);
      return true;
    }
    return false;
  };
  Mouse.prototype.mouseUp = function(point){
    this.set('pressed',false);
    return true; //?
  };
  Mouse.prototype.touch = function(point){
    if(this.containsPointFromEvent(point)){
      this.hovered = true;
      this.doFire('mousein');
      //this.mousein.fire();
      this.set('pressed',true);
      return true;
    }
    return false;
  };
  Mouse.prototype.untouch = function(){
    var ret = false;
    this.set('pressed',false);
    if(this.hovered){
      ret = true;
      this.hovered = false;
      this.doFire('mouseout');
      //this.mouseout.fire();
    }
    return ret;
  };
  Mouse.prototype.capturedPoint = function(point){
    return mathlib.pointInSpace(point,this.searchMatrix.get());
  };
  Mouse.prototype.containsPointFromEvent = function(point){
    var pos = this.capturedPoint(point);
    var ret = this.el.containsPoint(pos);
    if(ret){
      this.lastknownpos = pos;
    }
    return ret;
  };
  Mouse.prototype.onLongpress = function () {
    this.longpress.fire();
  };
  mylib.Mouse = Mouse;
}

module.exports = createMouse;
