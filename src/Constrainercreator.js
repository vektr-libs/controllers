function createConstrainer(lib,mylib){
  'use strict';
/**
* 
* @constructor Constrainer
* @augments AreaAware
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function Constrainer(controller,path){
    mylib.AreaAware.call(this,controller,path);
  }

  lib.inherit(Constrainer,mylib.AreaAware);

/**
* 
* @method clipValue
* @param {Number} v 
* @param {Number} clip
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.clipValue = function(v,clip){
    if(clip===0){
      return 0;
    }
    if(clip>0){
      if(v<clip){
        if(v<0){
          return 0;
        }else{
          return v;
        }
      }else{
        return clip;
      }
    }else{
      if(v>clip){
        if(v>0){
          return 0;
        }else{
          return v;
        }
      }else{
        return clip;
      }
    }
  };

/**
* 
* @method willFitHorizontally 
* @param {Object} otherareaaware 
* @param {Number} dx - X coordinate
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.willFitHorizontally = function(otherareaaware,dx){
    if(dx===0){return 0;}
    var bb = this.boundingBox.get(), obb = otherareaaware.boundingBox.get();
    if(dx>0){
      return this.clipValue(bb[0]+bb[2]-obb[0]-obb[2],dx);
    }else{
      return this.clipValue(bb[0]-obb[0],dx);
    }
  };

/**
* 
* @method willFitVertically 
* @param {Object} otherareaaware 
* @param {Number} dy - Y coordinate
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.willFitVertically = function(otherareaaware,dy){
    if(dy===0){return 0;}
    var bb = this.boundingBox.get(), obb = otherareaaware.boundingBox.get();
    if(dy>0){
      return this.clipValue(bb[1]+bb[3]-obb[1]-obb[3],dy);
    }else{
      return this.clipValue(bb[1]-obb[1],dy);
    }
  };

/**
* 
* @method willFit 
* @param {Object} otherareaaware 
* @param {Number} dx
* @param {Number} dy
* @instance
* @returns {Array}
* @memberof Constrainer
*/
  Constrainer.prototype.willFit = function(otherareaaware,dx,dy){
    return [this.willFitHorizontally(otherareaaware,dx),this.willFitVertically(otherareaaware,dy)];
  };

/**
* Cleans up and removes all properties of a Constrainer Object 
* @method __cleanUp
* @instance
* @private
* @memberof Constrainer
*/
  Constrainer.prototype.__cleanUp = function(){
    mylib.AreaAware.prototype.__cleanUp.call(this);
  };
  mylib.Constrainer = Constrainer;
}

module.exports = createConstrainer;
