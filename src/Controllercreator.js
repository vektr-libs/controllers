function createController(lib,hierarchymixinslib,modifierslib,commonlib,renderinglib,mylib){
  'use strict';
  //TODO: this.parentsChanged currently assumes a static parent-child hierarchy,
  //a dynamic hierarchy support would be nice...

/**
* 
* @constructor Controller
* @augments Modifier
* @augments Gettable
* @param {Object} elorcontroller - Object instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function Controller(elorcontroller,path){
    if(!(typeof path === 'object' && path instanceof Array)){
      throw new Error('path missing for the Controller constructor');
    }
    var stack = mylib.util.stackFromElorControllerAndPath(elorcontroller,path);
    this.active = new commonlib.ANDStackedProperty('display',stack);
    lib.Changeable.call(this);
    lib.Listenable.call(this);
    lib.Gettable.call(this);
    var el = this.active.stack[this.active.stack.length-1];
    modifierslib.Modifier.call(this,el);
    this.id = this.el.id+'_controller';
    hierarchymixinslib.DestroyableChild.call(this);
    this.activeChangedListener = this.active.changed.attach(this.onActiveChanged.bind(this));
  }

  lib.inherit(Controller,modifierslib.Modifier);

/**
* Cleans up and removes all properties of an Controller Object.
* @method __cleanUp
* @instance
* @private
* @memberof Controller
*/
  Controller.prototype.__cleanUp = function(){
    this.activeChangedListener.destroy();
    this.activeChangedListener = null;
    hierarchymixinslib.DestroyableChild.prototype.__cleanUp.call(this);
    this.id = null;
    modifierslib.Modifier.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Listenable.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
    this.active.destroy();
    this.active = null;
  };

/**
* @method get 
* @instance
* @memberof Controller
*/
  Controller.prototype.get = lib.Gettable.prototype.get;

/**
* @method get_active 
* @instance
* @memberof Controller
*/
  Controller.prototype.get_active = function(){
    return this.active ? this.active.get() : false;
  };

/**
* @method get_display
* @instance
* @memberof Controller
*/
  Controller.prototype.get_display = function(){
    return this.get('active');
  };

/**
* @method onActiveChanged 
* @instance
* @memberof Controller
*/
  Controller.prototype.onActiveChanged = function(){
    this.fireEvent('display',this.active.get());
  };

/**
* @method fireEvent
* @instance
* @memberof Controller
*/
  Controller.prototype.fireEvent = lib.Changeable.prototype.fireEvent;
  /*
  Controller.prototype.fireEvent = function(){
    lib.Changeable.prototype.fireEvent.apply(this,arguments);
    this.el.fireEvent('controller',this.id);
  };
  */

/**
* @method attachListener
* @instance
* @memberof Controller
*/
  Controller.prototype.attachListener = modifierslib.Modifier.prototype.attachListener;

/**
* Returns a child element of a given element by the given ID.
* @method childById
* @param {String} id - ID of an element
* @instance
* @memberof Controller
* @returns {Object}
*/
  Controller.prototype.childById = function(id){
    return this.el.childById(id);
  };

/**
* @method hotspotChildId
* @instance
* @memberof Controller
*/
  Controller.prototype.hotspotChildId = function(){
    return this.el.hotspotChildId();
  };

/**
* @method hotspotChildId
* @instance
* @memberof Controller
*/
  Controller.prototype.hotspotChild = function(){
    return this.el.hotspotChild();
  };

/**
* @method svgEl
* @instance
* @memberof Controller
*/
  Controller.prototype.svgEl = function(){
    var ret = this.active.stack[0];
    while(ret.active && ret.active.stack){
      ret = ret.active.stack[0];
    }
    if(ret.__parent instanceof renderinglib.SvgLayer){
      return ret.__parent;
    }
    return ret;
  };

  function toLocalSpace(m,stackel){
    stackel.toLocalSpace(m);
  }

/**
* @method toLocalSpace
* @param m
* @instance
* @memberof Controller
*/
  Controller.prototype.toLocalSpace = function(m){
    this.active.stack.forEach(toLocalSpace.bind(null,m));
  };

/**
* @method get_layer
* @instance
* @memberof Controller
*/
  Controller.prototype.get_layer = function(){
    return this.svgEl().__parent;
  };

/**
* @method scene
* @instance
* @memberof Controller
*/
  Controller.prototype.scene = function(){
    return this.get('layer').__parent;
  };

/**
* @method theater
* @instance
* @memberof Controller
*/
  Controller.prototype.theater = function(){
    var svg = this.svgEl();
    if(svg instanceof renderinglib.Svg){
      return svg.__parent;
    }
    if(svg instanceof renderinglib.SvgLayer){
      return svg.__parent.__parent.__parent;
    }
    return this.scene().__parent;
  };
  mylib.Controller = Controller;
}

module.exports = createController;
