function createDataEnvironment(lib,mylib){
  'use strict';
  function DataEnvironment(follower){
    this.follower = follower;
    mylib.Environment.call(this);
  }
  lib.inherit(DataEnvironment,mylib.Environment);
  DataEnvironment.prototype.addChild = function(chld){
    mylib.Environment.prototype.addChild.call(this,chld);
    chld.follower = this.follower;
  };
  DataEnvironment.prototype.__cleanUp = function(){
    mylib.Environment.prototype.__cleanUp.call(this);
    this.follower = null;
  };
  mylib.DataEnvironment = DataEnvironment;
}

module.exports = createDataEnvironment;
