function createSlider(lib,mylib){
  'use strict';
  function Slider(controller,groovepath,handlepath,direction,min,max,step){
    mylib.Controller.call(this,controller,[]);
    this.value = null;
    this.values = null;
    this.groove = new mylib.Mouse(this,groovepath);
    this.handle = new mylib.Draggable(this,handlepath);
    this.initHandlePos = this.handle.el.get('transformMatrix').slice(0,2);
    this.setValues(min,max,step);
    this.handle.constrainTo(this.groove,[],direction);
    switch(direction){
      case mylib.DragAware.HORIZONTAL:
      case mylib.DragAware.HORIZONTALINVERSE:
        this.handle.allowDirection(mylib.DragAware.LEFT+mylib.DragAware.RIGHT);
        break;
      case mylib.DragAware.VERTICAL:
      case mylib.DragAware.VERTICALINVERSE:
        this.handle.allowDirection(mylib.DragAware.UP+mylib.DragAware.DOWN);
        break;
    }
    this.handleReleasedListener = this.handle.attachListener('changed','dragged',this.onHandleDraggedChanged.bind(this));
    this.slidingSpace = new mylib.RelativePositionListener(this.groove,this.handle);
    this.slidingSpaceChangedListener = this.slidingSpace.changed.attach(this.onSlidingSpaceChanged.bind(this));
  }
  lib.inherit(Slider,mylib.Controller);
  Slider.prototype.__cleanUp = function(){
    this.slidingSpaceChangedListener.destroy();
    this.slidingSpaceChangedListener = null;
    this.slidingSpace.destroy();
    this.slidingSpace = null;
    this.handleReleasedListener.destroy();
    this.handleReleasedListener = null;
    this.initHandlePos = null;
    this.handle.destroy();
    this.handle = null;
    this.groove.destroy();
    this.groove = null;
    this.values = null;
    this.value = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  Slider.prototype.set = lib.Changeable.prototype.set;

  Slider.prototype.setMax = function () {
    this.set('value',this.values.max);
  };

  Slider.prototype.setMin = function () {
    this.set('value',this.values.min);
  };

  Slider.prototype.stepUp = function () {
    var val = this.get('value')+this.values.step;
    if(val<=this.values.max){
      this.set('value',val);
    }
  };

  Slider.prototype.stepDown = function () {
    var val = this.get('value')-this.values.step;
    if(val>=this.values.min){
      this.set('value',val);
    }
  };

  Slider.prototype.valueToDelta = function(){
    var ss = this.slidingSpace.get(),total = this.values.max-this.values.min, valperc = (this.value-this.values.min)/total, posperc, perccorr;
    switch(this.handle.constrainDirection){
      case mylib.DragAware.HORIZONTAL:
        posperc = ss[0]/ss[2];
        break;
      case mylib.DragAware.VERTICAL:
        posperc = ss[1]/ss[3];
        break;
      case mylib.DragAware.VERTICALINVERSE:
        posperc = (ss[3]-ss[1])/ss[3];
        factor = -1;
        break;
    }
    perccorr = valperc-posperc;
    //console.log('valperc',valperc,'posperc',posperc,'delta',perccorr*ss[2]);
    return [perccorr*ss[2],((this.handle.constrainDirection === mylib.DragAware.VERTICAL)?1:-1)*perccorr*ss[3]];
  };

  Slider.prototype.set_value = function(val){
    //console.log('Slider should move to',val);
    this.value = val;
    this.updateHandlePos();
  };
  function compareHashes(orig,comp){
    if(!(orig&&comp)){
      return false;
    }
    for(var i in orig){
      if(orig[i]!==comp[i]){
        return false;
      }
    }
    return true;
  }
  Slider.prototype.setValues = function(min,max,step){
    var obj = {
      min:min,
      max:max,
      step:step
    };
    if(!compareHashes(this.values,obj)){
      this.handle.el.moveTo.apply(this.handle.el,this.initHandlePos);
      this.values = obj;
      this.value = null;
    }
  };
  Slider.prototype.roundToStep = function(pos,length){
    var stepratio = this.values.step/(this.values.max-this.values.min),
      posratio = pos/length,
      stepcount = Math.round(posratio/stepratio);
    var ret = this.values.min + stepcount*this.values.step;
    if(ret>this.values.max){
      return this.values.max;
    }
    //console.log('roundToStep yields',ret,'on',posratio,'/',stepratio,'=',posratio/stepratio);
    return ret;
  };
  Slider.prototype.onSlidingSpaceChanged = function(){
    if(!(this.values && 'undefined'!== typeof this.values.min)){
      return 0;
    }
    var ss = this.slidingSpace.get();
    switch(this.handle.constrainDirection){
      case Slider.HORIZONTAL:
        this.set('value',this.roundToStep(ss[0],ss[2]));
        break;
      case Slider.VERTICAL:
        this.set('value',this.roundToStep(ss[1],ss[3]));
        break;
      case Slider.VERTICALINVERSE:
        this.set('value',this.roundToStep(ss[3]-ss[1],ss[3]));
        break;
      default:
        this.set('value',[this.roundToStep(ss[0],ss[2]),this.roundToStep(ss[1],ss[3])]);
        break;
    }
  };
  Slider.prototype.onHandleDraggedChanged = function(val){
    if(val===false){
      this.updateHandlePos();
      //lib.runNext(this.onSlidingSpaceChanged.bind(this));
    }
  };
  Slider.prototype.updateHandlePos = function(){
    lib.applyNext(this.handle.moveBy.bind(this.handle),this.valueToDelta());
    //this.handle.moveBy.apply(this.handle,this.valueToDelta());
  };
  Slider.HORIZONTAL = 1;
  Slider.HORIZONTALINVERSE = 2;
  Slider.VERTICAL = 4;
  Slider.VERTICALINVERSE = 8;
  mylib.Slider = Slider;
}

module.exports = createSlider;
