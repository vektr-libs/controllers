function createStandalone(lib,commonlib,renderinglib,mylib){
  'use strict';
  function svgOfElement(el){
    var e = el;
    while(e && !(e instanceof renderinglib.Svg)){
      e = e.__parent;
    }
    return e;
  }

  function Standalone(controller,path,scene,layerindex){
    var svg = controller;
    if(!(svg instanceof renderinglib.Svg)){
      if(!(svg instanceof Standalone)){
        svg = controller.active.stack[0];
        if(!(svg instanceof Standalone)){
          svg = svgOfElement(controller.el);
          if(!svg){
            throw controller.el+' has no svg parent any more';
          }
        }else{
          svg = svg.layer;
        }
      }else{
        svg = svg.layer;
      }
    }else{
      throw "Standalone is not meant to be used on svgs, use Controller instead";
    }
    var c = new mylib.HotspotAware(controller,path);
    var ms = new commonlib.MatrixStack(c.active.stack.slice(0,c.active.stack.length-1));
    c.el.leaveParent();

    mylib.HotspotAware.call(this,c.el,[]);
    this.layer = new renderinglib.SvgLayer(svg,ms.get(),this.boundingBox, c.el,scene,layerindex);

    c.destroy();
    ms.destroy();
  }
  lib.inherit(Standalone,mylib.HotspotAware);
  Standalone.prototype.__cleanUp = function(){
    this.layer.destroy();
    this.layer = null;
    mylib.HotspotAware.prototype.__cleanUp.call(this);
  };

  Standalone.prototype.render = function(width,height,ctx){
    this.el.render(width,height,ctx);
  };
  mylib.Standalone = Standalone;
}

module.exports = createStandalone;
