function createDragAware(lib, mylib) {
  'use strict';
  function MoveEvaluator(){
    this.trend = null;
    this.pathx = 0;
    this.pathy = 0;
    this.totalx = 0;
    this.totaly = 0;
    this.start = 0;
    this.speed = 0;

    this.last_known_pos = null;
    this.last_speed = null;
    this.last_record = null;
  }
  MoveEvaluator.prototype.destroy = function(){
    this.last_known_pos = null;
    this.last_speed = null;
    this.last_record = null;

    this.speed = null;
    this.start = null;
    this.totaly = null;
    this.totalx = null;
    this.pathy = null;
    this.pathx = null;
    this.trend = null;
  };
  MoveEvaluator.prototype.reset = function(last_known_pos){
    this.pathx = 0;
    this.pathy = 0;
    this.trend = null;
    this.totalx = 0;
    this.totaly = 0;
    this.start = Date.now();
    this.speed = 0;
    this.last_known_pos = last_known_pos;
    this.last_speed = 0;
    this.last_record = Date.now();
  };
  MoveEvaluator.prototype.accountFor = function(dx,dy, last_known_pos){
    this.totalx += Math.abs(dx);
    this.totaly += Math.abs(dy);
    var n = Date.now();
    if(n>this.start){
      this.speed = Math.sqrt(this.totalx*this.totalx+this.totaly*this.totaly)/(n-this.start);
    }
    switch(this.trend){
      case DragAware.HORIZONTAL:
        this.pathx=0;
        this.pathy=dy;
        return;
      case DragAware.VERTICAL:
        this.pathx=dx;
        this.pathy=0;
        return;
    }
    this.pathx+=dx;
    this.pathy+=dy;
    var x2 = this.pathx*this.pathx, y2 = this.pathy*this.pathy, d = (x2+y2);
    if(d<169){return;}
    if(x2>2*y2){
      this.goHorizontal();
      return;
    }
    if(y2>2*x2){
      this.goVertical();
      return;
    }
    if(d>255 && !this.trend){
      this.goHorizontal();
      return;
    }
  };
  MoveEvaluator.prototype.goHorizontal = function(){
    this.trend = DragAware.HORIZONTAL;
    this.pathx = 0;
  };
  MoveEvaluator.prototype.goVertical = function(){
    this.trend = DragAware.VERTICAL;
    this.pathy = 0;
  };

  function DragAware (controller, path, hotspot){
    mylib.Controller.call(this,controller,path);
    this.loc = [0,0];
    this.dragged = false;
    this.constrainer = null;
    this.moveEvaluator = new MoveEvaluator();
    this.freeMove = true;
    this.constrainDirection = null;
    this.restrictDirection = null;
    this.allowedDirection = DragAware.LEFT+DragAware.RIGHT+DragAware.DOWN+DragAware.UP;
    this.hotspot = hotspot || new mylib.Mouse(this,[this.el.hotspotChildId()]);
    this.hotspotMovedListener = this.hotspot.attachListener('changed','boundingBox',this.onMoved.bind(this));
    this.hotspotPressedListener = this.hotspot.attachListener('mousepressed',this.onDragStart.bind(this));
    this.hotspotClickedListener = this.hotspot.attachListener('clicked',this.onDragEnd.bind(this));
    this.hotspotDraggedListener = this.hotspot.attachListener('mousedragged',this.onDrag.bind(this));
    this.clicked = new lib.HookCollection();
    this.boundingBox = this.hotspot.boundingBox;
  }
  lib.inherit(DragAware,mylib.Controller);
  DragAware.prototype.__cleanUp = function(){
    this.boundingBox = null;
    this.clicked.destruct();
    this.clicked = null;
    this.hotspotMovedListener.destroy();
    this.hotspotMovedListener = null;
    this.hotspotPressedListener.destroy();
    this.hotspotPressedListener = null;
    this.hotspotClickedListener.destroy();
    this.hotspotClickedListener = null;
    this.hotspotDraggedListener.destroy();
    this.hotspotDraggedListener = null;
    if(this.hotspot && this.hotspot.active.stack[0] === this){
      this.hotspot.destroy(); //I made this hotspot; didn't get it thru constructor
    }
    this.hotspot = null;
    this.allowedDirection = null;
    this.restrictDirection = null;
    this.constrainDirection = null;
    this.freeMove = null;
    this.moveEvaluator.destroy();
    this.moveEvaluator = null;
    if(this.constrainer){
      this.constrainer.destroy();
    }
    this.constrainer = null;
    this.dragged = null;
    this.loc = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  DragAware.prototype.get_boundingBox = function(){
    return this.hotspot.boundingBox.get();
  };
  DragAware.prototype.onMoved = function(){
    this.fireEvent('boundingBox',true);
  };
  DragAware.prototype.set_freeMove = function(val){
    this.freeMove = val;
  };
  DragAware.prototype.onDragStart = function(){
    this.moveEvaluator.reset(this.hotspot.lastknownpos);
    this.set('dragged',true);
    this.loc = this.hotspot.lastknownpos.slice();
  };
  DragAware.prototype.onDrag = function(){
    var l = this.loc, m = this.hotspot.lastknownpos, dx = m[0]-l[0], dy = m[1]-l[1], wf;
    switch(this.restrictDirection){
      case DragAware.HORIZONTAL:
      case DragAware.HORIZONTALINVERSE:
        dy = 0;
        break;
      case DragAware.VERTICAL:
      case DragAware.VERTICALINVERSE:
        dx = 0;
        break;
    }
    if(dx<0&&!(this.allowedDirection&DragAware.LEFT)){
      dx = 0;
    }
    if(dx>0&&!(this.allowedDirection&DragAware.RIGHT)){
      dx = 0;
    }
    if(dy>0&&!(this.allowedDirection&DragAware.DOWN)){
      dy = 0;
    }
    if(dy<0&&!(this.allowedDirection&DragAware.UP)){
      dy = 0;
    }
    this.moveEvaluator.accountFor(dx,dy);
    if(!this.freeMove && this.moveEvaluator && this.moveEvaluator.trend){
      dx-=this.moveEvaluator.pathx;
      dy-=this.moveEvaluator.pathy;
    }
    if(this.constrainer){
      switch(this.constrainDirection){
        case DragAware.HORIZONTAL:
          dx = this.constrainer.willFitHorizontally(this.hotspot,dx);
          break;
        case DragAware.VERTICAL:
        case DragAware.VERTICALINVERSE:
          dy = this.constrainer.willFitVertically(this.hotspot,dy);
          break;
        default:
          wf = this.constrainer.willFit(this.hotspot,dx,dy);
          dx = wf[0];
          dy = wf[1];
          break;
      }
    }
    this.handleDrag (dx, dy);
    this.update_loc(dx, dy);
  };
  DragAware.prototype.update_loc = function (dx, dy) {
    this.loc[0]+=dx;
    this.loc[1]+=dy;
  };
  DragAware.prototype.onDragEnd = function(){
    if(!this.moveEvaluator.trend){
      this.shouldClick();
    }
    this.set('dragged',false);
  };
  DragAware.prototype.shouldClick = function(){
    this.clicked.fire();
  };
  DragAware.prototype.restrictTo = function(direction){
    this.restrictDirection = direction;
  };
  DragAware.prototype.allowDirection = function(alloweddirection){
    this.allowedDirection = alloweddirection;
  };
  DragAware.prototype.constrainTo = function(controller,path,direction){
    if(this.constrainer){
      this.constrainer.destroy();
    }
    this.constrainer = new mylib.Constrainer(controller,path);
    this.constrainDirection = direction;
  };
  DragAware.prototype.set_enabled = function(val){
    this.hotspot.el.set('display',val);
  };
  DragAware.prototype.get_enabled = function(){
    return this.hotspot.get('display');
  };

  DragAware.HORIZONTAL = 1;
  DragAware.HORIZONTALINVERSE = 2;
  DragAware.VERTICAL = 4;
  DragAware.VERTICALINVERSE = 8;
  DragAware.LEFT = 1;
  DragAware.RIGHT = 2;
  DragAware.DOWN = 4;
  DragAware.UP = 8;

  mylib.DragAware = DragAware;

}

module.exports = createDragAware;
