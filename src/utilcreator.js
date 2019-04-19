function createUtil(lib,mylib){
  'use strict';
  function augmentGeometryStack(el){
    if(el.active && el.active.stack){
      el.active.stack.forEach(augmentGeometryStack.bind(this));
    }else{
      this.push(el);
    }
  }

  function transformMatrixStackFromController(controller){
    var ret = [];
    controller.active.stack.forEach(augmentGeometryStack.bind(ret));
    return ret;
  }

  function augmentStack(elid){
    var el = this[this.length-1].childById(elid);
    if(!el){
      throw new Error('Element '+this[this.length-1].id+' has no child with id '+elid);
    }
    this.push(el);
  }

  function stackFromElorControllerAndPath(elorcontroller,path){
    var ret = [elorcontroller];
    //var ret = (elorcontroller.active && elorcontroller.active.stack) ? elorcontroller.active.stack.slice() : [elorcontroller];
    path.forEach(augmentStack.bind(ret));
    return ret;
  }
  mylib.util.transformMatrixStackFromController = transformMatrixStackFromController;
  mylib.util.stackFromElorControllerAndPath = stackFromElorControllerAndPath;
}

module.exports = createUtil;
