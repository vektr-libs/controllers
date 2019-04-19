function createRelativePositionListener(lib,mylib){
  'use strict';
  function checkForBoundingBoxProperty(obj){
    if(!(obj && obj.boundingBox && 'function' === typeof obj.boundingBox.get)){
      throw obj+' has no boundingBox property';
    }
  }
  function RelativePositionListener(areaaware1,areaaware2){
    checkForBoundingBoxProperty(areaaware1);
    checkForBoundingBoxProperty(areaaware2);
    lib.Changeable.call(this);
    this.anchor = areaaware1;
    this.target = areaaware2;
    this.value = [0,0,0,0];
    this._matrixListeners = [];
    var aas1 = areaaware1.boundingBox.targets.transformMatrix.prop.stack,
      aas2 = areaaware2.boundingBox.targets.transformMatrix.prop.stack,
      l = Math.min(aas1.length,aas2.length),
      commonlength = 0,
      i,m;
    for(i = 0; i<l; i++){
      if(aas1[i]===aas2[i]){
        commonlength++;
      }else{
        break;
      }
    }
    this.monitorStack(aas1,commonlength);
    this.monitorStack(aas2,commonlength);
    this.calculateValue();
  }
  lib.inherit(RelativePositionListener,lib.Changeable);
  RelativePositionListener.prototype.destroy = function(){
    lib.Changeable.prototype.__cleanUp.call(this);
    this.anchor = null;
    this.target = null;
    while(this._matrixListeners.length){
      this._matrixListeners.pop().destroy();
    }
  };
  RelativePositionListener.prototype.monitorStack = function(stack,startfrom){
    var se;
    for(var i = startfrom; i<stack.length; i++){
      se = stack[i];
      this._matrixListeners.push(se.attachListener('changed','transformMatrix',this.onMatrixChanged.bind(this,se)));
    }
  };
  RelativePositionListener.prototype.calculateValue = function(){
    var bba = this.anchor.boundingBox.get(), bbt = this.target.boundingBox.get();
    this.value[0] = bbt[0]-bba[0];
    this.value[1] = bbt[1]-bba[1];
    this.value[2] = bba[2]-bbt[2];
    this.value[3] = bba[3]-bbt[3];
  };
  RelativePositionListener.prototype.get = function(){
    if(this.dirty){
      this.calculateValue();
      this.dirty = false;
    }
    return this.value;
  };
  RelativePositionListener.prototype.onMatrixChanged = function(el,matrix){
    this.dirty = true;
    this.changed.fire();
  };

  mylib.RelativePositionListener = RelativePositionListener;
}

module.exports = createRelativePositionListener;
