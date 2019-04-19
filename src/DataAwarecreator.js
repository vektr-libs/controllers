function createDataAware(lib,mylib){
  'use strict';
  function copyCat(bla){
    return bla;
  }
  function StaticScalarFollower(dataaware,datatosvgnamecb,childfactory){
    this.__parent = dataaware;
    this.datatosvgnamecb = datatosvgnamecb;
    this.childfactory = childfactory;
    this.elements = {};
    this.listener = dataaware.follower.listenToScalars('bla',{activator:this.onCreated.bind(this),setter:this.onSet.bind(this),deactivator:this.onDestroyed.bind(this)});
  }
  StaticScalarFollower.prototype.removeElement = function(el,elid){
    delete this.elements[elid];
  };
  StaticScalarFollower.prototype.onCreated = function(dataname){
    var ch = this.__parent.findChildOrDerivate(this.datatosvgnamecb,this.childfactory,dataname);
    if(ch){
      this.elements[dataname] = ch;
      ch.set('display',true);
    }
  };
  StaticScalarFollower.prototype.onSet = function(dataname,val){
    var el = this.elements[dataname];
    if(el){
      el.set('text',val);
    }
  };
  StaticScalarFollower.prototype.onDestroyed = function(dataname){
    var el = this.elements[dataname];
    if(el){
      this.removeElement(el,dataname);
      el.set('display',false);
    }
  };
  StaticScalarFollower.prototype.destroy = function(){
    this.listener.destroy();
    this.listener = null;
    lib.traverse(this.elements,this.removeElement.bind(this));
    this.elements = null;
    this.childfactory = null;
    this.datatosvgnamecb = null;
    this.__parent = null;
  };


  function DataAware(elorcontroller,path,dbpath,type){
    this.follower = null;
    this.followerlistener = null;
    mylib.Controller.call(this,elorcontroller,path);
    this.theater().environments.dcp.addChild(this);
    var dbpa = dbpath.split('/'),cursor=0;
    while(cursor<dbpa.length-1 && this.follower){
      this.follower = this.follower.follow(dbpa[cursor]);
      cursor++;
    }
    switch(type){
      case 'collection':
        this.followerlistener = this.follower.listenToCollection('bla',dbpa[cursor],{activator:this.el.show.bind(this.el),deactivator:this.el.hide.bind(this.el)});
        break;
      case 'scalar':
        this.followerlistener = this.follower.listenToScalar('bla',dbpa[cursor],{activator:this.el.show.bind(this.el),deactivator:this.el.hide.bind(this.el),setter:this.el.set.bind(this.el,'text')});
        break;
    }
    this.follower = this.follower.follow(dbpa[cursor]);
    if(!this.follower){
      throw 'No follower at path '+path;
    }
  }
  lib.inherit(DataAware,mylib.Controller);
  DataAware.prototype.destroy = function(){
    lib.Destroyable.prototype.destroy.call(this);
  };
  DataAware.prototype.__cleanUp = function(){
    if(this.followerlistener){
      this.followerlistener.destroy();
    }
    this.follower = null;
    this.followerlistener = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  DataAware.prototype.findChild = function(datatosvgnamecb,dataname){
    return this.el.childById(datatosvgnamecb(dataname));
  };
  DataAware.prototype.findChildOrDerivate = function(datatosvgnamecb,childfactory,dataname){
    var ret =  this.el.childById(datatosvgnamecb(dataname));
    if(!ret){
      return lib.apply(childfactory,[dataname,this.follower.follow(dataname),this]);
    }
    return ret;
  };
  DataAware.prototype.applyToChild = function(datatosvgnamecb,operation){//,dataname){
    var args = Array.prototype.slice.call(arguments,2),dataname = args.pop();
    var ch = this.findChild(datatosvgnamecb,dataname);
    if(ch){
      var m = ch[operation];
      if('function' === typeof m){
        m.apply(ch,args);
      }
    }
  };
  DataAware.prototype.applyToChildOrDerivate = function(datatosvgnamecb,childfactory,operation){//,dataname){
    var args = Array.prototype.slice.call(arguments,3),dataname = args.pop();
    var ch = this.findChildOrDerivate(datatosvgnamecb,childfactory,dataname);
    if(ch){
      var m = ch[operation];
      if('function' === typeof m){
        m.apply(ch,args);
      }
    }
  };
  DataAware.prototype.followStatically = function(type,datatosvgnamecb,childfactory){
    if(typeof datatosvgnamecb !== 'function'){
      datatosvgnamecb = copyCat;
    }
    var methodname,obj = {activator:this.applyToChild.bind(this,datatosvgnamecb,'set','display','true'),deactivator:this.applyToChild.bind(this,datatosvgnamecb,'hide')};
    switch(type){
      case 'collections':
        return this.follower.listenToCollections('bla',obj);
      case 'scalars':
        return new StaticScalarFollower(this,datatosvgnamecb,childfactory);
      default:
        return;
    }
  };
  DataAware.prototype.followDynamically = function(type,datatosvgnamecb,childfactory){
    if(typeof datatosvgnamecb !== 'function'){
      datatosvgnamecb = copyCat;
    }
    if(typeof childfactory !== 'function'){
      return;
    }
    var methodname,obj = {activator:this.applyToChildOrDerivate.bind(this,datatosvgnamecb,childfactory,'set','display','true'),deactivator:this.applyToChild.bind(this,datatosvgnamecb,'destroy')};
    switch(type){
      case 'collections':
        methodname = 'listenToCollections';
        break;
      case 'scalars':
        methodname = 'listenToScalars';
        //obj.setter = [this,this.applyToChildOrDerivate,[datatosvgnamecb]];
        break;
      default:
        return;
    }
    return this.follower[methodname](null,obj);
  };
  DataAware.prototype.setChildText = function(datatosvgnamecb,dataname,val){
    //var ch = this.el.childById
  };
  mylib.DataAware = DataAware;
}

module.exports = createDataAware;
