function createAreaAware(lib,renderinglib,commonlib,mathlib,mylib){
  'use strict';

/**
* Adds a listener on given element properties.
* @constructor BoundingBoxProperty
* @augments LazyListener
* @param {Array} neededtargetnames - Array of element properties to listen
* @private
*/
  function BoundingBoxProperty(neededtargetnames){
    commonlib.LazyListener.call(this,neededtargetnames);
  }
  lib.inherit(BoundingBoxProperty,commonlib.LazyListener);

/**
* Calculates the values related to the element's position (x, y, x+width, y+height).
* Returns a matrix in the following form [[x, y], [x+width, y+height]].
* @method calculateValue
* @instance
* @memberof BoundingBoxProperty
*/
  BoundingBoxProperty.prototype.calculateValue = function(){
    return mathlib.boundingBoxInSpace(this.targets.content.prop.boundingBox(),this.targets.transformMatrix.get());
  };

/**
* Gains knowledge about the hotspot of an element and recalculates it's position in the coordinate system as and if it changes position. 
* @constructor AreaAware
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function AreaAware(controller,path){
    mylib.Controller.call(this,controller,path);
    this.content = null;
    this.transformMatrix = new commonlib.MatrixStack(mylib.util.transformMatrixStackFromController(this));
    var shape = this.el;
    while(shape && !(shape instanceof renderinglib.Shape)){
      shape = shape.el;
    }
    if(!shape){
      throw new Error('No shape in '+this.el.id);
    }else{
      this.content = shape.content;
    }
    this.boundingBox = new BoundingBoxProperty(['content','transformMatrix']);
    this.boundingBox.add('content',this.content);
    this.boundingBox.add('transformMatrix',this.transformMatrix);
    this.boundinBoxChangedListener = this.boundingBox.changed.attach(this.onBoundingBoxChanged.bind(this));
  }
  lib.inherit(AreaAware,mylib.Controller);
/**
* Fires the "boundingbox" event
* @method onBoundingBoxChanged
* @instance
* @memberof AreaAware
*/
  AreaAware.prototype.onBoundingBoxChanged = function(){
    this.fireEvent('boundingBox',true);
  };
/**
* Cleans up and removes all properties of an AreaAware Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof AreaAware
*/
  AreaAware.prototype.__cleanUp = function(){
    this.boundinBoxChangedListener.destroy();
    this.boundinBoxChangedListener = null;
    this.boundingBox.destroy();
    this.boundingBox = null;
    this.transformMatrix.destroy();
    this.transformMatrix = null;
    this.content = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  mylib.AreaAware = AreaAware;
}

module.exports = createAreaAware;
