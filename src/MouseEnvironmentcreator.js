function createMouseEnvironment(lib,mylib){
  'use strict';
  var LONGPRESS_INTERVAL = 2000;
  function eventDefaultPreventer(event) {
    event.preventDefault();
  }
  if('ontouchmove' in document.documentElement){
    document.body.addEventListener('touchmove', eventDefaultPreventer, false); 
  }
  function MouseEnvironment(canvas){
    mylib.Environment.call(this);
    this.canvas = null;
    this.lastpos = [69,47];
    this._to = null;
    if(canvas){
      this.canvas = canvas;
      if('ontouchstart' in document.documentElement){
        this.canvas.el.ontouchstart = this.touched.bind(this);
        this.canvas.el.ontouchmove = this.touchmoved.bind(this);
        this.canvas.el.ontouchend = this.untouched.bind(this);
      }else{
        this.canvas.el.onmousemove = this.moved.bind(this);
        this.canvas.el.onmousedown = this.down.bind(this);
        //this.canvas.el.onmouseup = this.up.bind(this);
        document.onmouseup = this.up.bind(this);
        /*
        document.onmousemove = this.moved.bind(this);
        document.onmousedown = this.down.bind(this);
        document.onmouseup = this.up.bind(this);
        */
      }
    }
  }
  lib.inherit(MouseEnvironment,mylib.Environment);
  MouseEnvironment.prototype.__cleanUp = function(){
    this._clearTo();
    if(this.canvas){
      if('ontouchstart' in document.documentElement){
        this.canvas.el.ontouchstart = null;
        this.canvas.el.ontouchmove = null;
        this.canvas.el.ontouchend = null;
      }else{
        this.canvas.el.onmousemove = null;
        this.canvas.el.onmousedown = null;
        //this.canvas.el.onmouseup = null;
        document.onmouseup = null;
      }
    }
    this.canvas = null;
    this.lastpos = null;
    mylib.Environment.prototype.__cleanUp.call(this);
  };
  MouseEnvironment.prototype.mouseMovedToChild = function(evnt,chld){
    return chld.mouseMoved(evnt);
  };
  MouseEnvironment.prototype.mouseDownToChild = function(evnt,chld){
    return chld.mouseDown(evnt);
  };
  MouseEnvironment.prototype.touchToChild = function(evnt,chld){
    return chld.touch(evnt);
  };
  MouseEnvironment.prototype.mouseUpToChild = function(chld){
    return chld.mouseUp();
  };
  MouseEnvironment.prototype.untouchToChild = function(chld){
    return chld.untouch();
  };

  MouseEnvironment.prototype.longpressToChild = function (chld) {
    return chld.onLongpress();
  };

  MouseEnvironment.prototype.moved = function(evnt){
    if(!this.canvas){
      this.lastpos[0] = evnt[0];
      this.lastpos[1] = evnt[1];
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,evnt));
    }else{
      var br = this.canvas.el.getBoundingClientRect();
      this.lastpos[0] = evnt.pageX-br.left;
      this.lastpos[1] = evnt.pageY-br.top;
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,this.lastpos));
    }
  };
  MouseEnvironment.prototype.touchmoved = function(evnt){
    if(!this.canvas){
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,evnt));
    }else{
      var now = (new Date()).getTime();
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,[evnt.touches[0].pageX-br.left,evnt.touches[0].pageY-br.top]));
    }
  };

  MouseEnvironment.prototype.longpress = function () {
    this.__childStatesToCheck = {active: true};
    return this.dispatchEvent(this.longpressToChild.bind(this));
  };

  MouseEnvironment.prototype._startTo = function () {
    this._clearTo();
    this._to = setTimeout(this.longpress.bind(this), LONGPRESS_INTERVAL);
  };

  MouseEnvironment.prototype._clearTo = function () {
    if (this._to) clearTimeout(this._to);
    this._to = null;
  };

  MouseEnvironment.prototype.down = function(evnt){
    var ret;
    this._startTo();
    if(!this.canvas){
      ret = this.dispatchEvent(this.mouseDownToChild.bind(this,evnt));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.mouseDownToChild.bind(this,[evnt.pageX-br.left,evnt.pageY-br.top]));
    }
    //now that the mouse is pressed, start notifying just the pressed listeners
    this.__childStatesToCheck = {pressed:true};
    return ret;
  };
  MouseEnvironment.prototype.touched = function(evnt){
    var ret=0;
    this._startTo();
    if(!this.canvas){
      ret = this.dispatchEvent(this.touchToChild.bind(this,evnt));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.touchToChild.bind(this,[evnt.touches[0].pageX-br.left,evnt.touches[0].pageY-br.top]));
    }
    this.__childStatesToCheck = {pressed:true};
    return ret;
  };
  MouseEnvironment.prototype.up = function(evnt){
    this._clearTo();
    var ret;
    //now that the mouse is released, start notifying all the active listeners
    this.__childStatesToCheck = {active:true};
    if(!this.canvas){
      ret = this.dispatchEvent(this.mouseUpToChild.bind(this));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      ret = this.dispatchEvent(this.mouseUpToChild.bind(this));
    }
    return ret;
  };
  MouseEnvironment.prototype.untouched = function(evnt){
    this._clearTo();
    var ret;
    this.__childStatesToCheck = {active:true};
    if(!this.canvas){
      ret = this.dispatchEvent(this.untouchToChild.bind(this));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.untouchToChild.bind(this));
    }
    return ret;
  };
  mylib.MouseEnvironment = MouseEnvironment;
}

module.exports = createMouseEnvironment;
