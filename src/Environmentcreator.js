function createEnvironment(lib,hierarchymixinslib,mylib){
  'use strict';
  function Environment(){
    lib.Destroyable.call(this);
    hierarchymixinslib.DestroyableParent.call(this);
    mylib.EventDispatcher.call(this);
  }
  lib.inherit(Environment,hierarchymixinslib.DestroyableParent);
  Environment.prototype.destroy = lib.Destroyable.prototype.destroy;
  Environment.prototype.__cleanUp = function(){
    mylib.EventDispatcher.prototype.__cleanUp.call(this);
    hierarchymixinslib.DestroyableParent.prototype.__cleanUp.call(this);
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  Environment.prototype.dispatchToChild = mylib.EventDispatcher.prototype.dispatchToChild;
  Environment.prototype.dispatchEvent = mylib.EventDispatcher.prototype.dispatchEvent;
  Environment.prototype.checkChildStates = mylib.EventDispatcher.prototype.checkChildStates;
  Environment.prototype.checkChildState = mylib.EventDispatcher.prototype.checkChildState;
  mylib.Environment = Environment;
}

module.exports = createEnvironment;
