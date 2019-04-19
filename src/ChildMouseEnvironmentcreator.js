function createChildMouseEnvironment(lib,mylib){
  'use strict';
/**
* Creates an environment on a canvas instance, catches and dispatches mouse events.
* @constructor ChildMouseEnvironment
* @param {Object} canvas - Canvas instance
* @augments MouseEnvironment
* @augments Gettable
*/
  function ChildMouseEnvironment(canvas){
    lib.Gettable.call(this);
    mylib.MouseEnvironment.call(this,canvas);
    this.pressed = false;
  }

  lib.inherit(ChildMouseEnvironment,mylib.MouseEnvironment);

/**
*
* @method get
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.get = lib.Gettable.prototype.get;

/**
* Catches and dispatches Mouse Down event
* @method down
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.down = function(evnt){
    this.pressed = (mylib.MouseEnvironment.prototype.down.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Touched event
* @method touched
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.touched = function(evnt){
    this.pressed = (mylib.MouseEnvironment.prototype.touched.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Moved event
* @method moved
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.moved = function(evnt){
    this.pressed &= (mylib.MouseEnvironment.prototype.moved.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse TouchMoved event
* @method touchmoved
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.touchmoved = function(evnt){
    this.pressed &= (mylib.MouseEnvironment.prototype.touchmoved.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Untouched event
* @method untouched
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.untouched = function(evnt){
    mylib.MouseEnvironment.prototype.untouched.call(this,evnt);
    this.pressed = false;
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Up event
* @method up
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.up = function(evnt){
    mylib.MouseEnvironment.prototype.up.call(this,evnt);
    this.pressed = false;
    return this.pressed;
  };

/**
* Cleans up and removes all properties of a ChildMouseEnvironment Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.__cleanUp = function(){
    this.pressed = null;
    mylib.MouseEnvironment.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
  };

  mylib.ChildMouseEnvironment = ChildMouseEnvironment;

}

module.exports = createChildMouseEnvironment;
