function createEventDispatcher(lib,mylib){
  'use strict';
  function EventDispatcher(){
    this.__childStatesToCheck = {
      active:true
    };
  }
  EventDispatcher.prototype.dispatchToChild = function(affectedchildren,handler,chld){
    //var isactive = (chld.active && chld.active.get) ? chld.active.get() : chld.active;
    var isactive = this.checkChildStates(chld);
    if(!isactive){
      return;
    }
    var aff = handler(chld);
    if(aff){
      affectedchildren.count++;
      return true;
    }
  };
  EventDispatcher.prototype.checkChildStates = function(chld){
    for(var s in this.__childStatesToCheck){
      if(!this.__childStatesToCheck[s]){
        continue;
      }
      if(!this.checkChildState(chld,s)){
        return false;
      }
    }
    return true;
  };
  EventDispatcher.prototype.checkChildState = function(chld,statename){
    var ret = chld.get(statename);
    if(!ret){
      return ret;
    }
    if('function' === typeof ret.get){
      return ret.get();
    }else{
      return ret;
    }
  };
  EventDispatcher.prototype.dispatchEvent = function(handler){
    var affectedchildren = {count:0};
    this.__children.traverse(this.dispatchToChild.bind(this,affectedchildren,handler));
    return affectedchildren.count;
  };
  EventDispatcher.prototype.__cleanUp = function(){
    this.__childStatesToCheck = null;
  };
  mylib.EventDispatcher = EventDispatcher;
}

module.exports = createEventDispatcher;
