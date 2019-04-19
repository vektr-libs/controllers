function createListContainer(lib,modifierslib,mathlib,algorithms,mylib){
  'use strict';
  var DragAware = mylib.DragAware, Sticky = algorithms.Sticky, Animator = modifierslib.Animator;
  function to_bool (v) {return !!v;}

  function SpatialHelper (orientation, itembb, containerbb) {
    this.itembb = itembb;
    this.containerbb = containerbb;
    this.horizontal = (orientation === ListContainer.LEFTTORIGHT);

    ///decide once for all ...
    if (mathlib.boundingBoxesOverlap(containerbb, itembb)) {
      this.side = 0;
    }else if (this.get_pos(containerbb) <= this.get_pos()) {
      this.side = 1;
    }else {
      this.side = -1;
    }
  }

  SpatialHelper.prototype.destroy = function () {
    this.side = null;
    this.horizontal = null;
    this.containerbb = null;
    this.itembb = null;
  };

  SpatialHelper.prototype.get_pos = function (bb) {
    return SpatialHelper.get_pos(this.horizontal, bb ? bb : this.itembb);
  };

  SpatialHelper.prototype.get_dim = function (bb) {
    return SpatialHelper.get_dim(this.horizontal, bb ? bb : this.itembb);
  };

  SpatialHelper.get_dim = function (is_horizontal, bb) {
    return is_horizontal ? bb[2] : bb[3];
  };
  SpatialHelper.get_pos = function (is_horizontal, bb) {
    return is_horizontal ? bb[0] : bb[1];
  };

  SpatialHelper.add_dimension = function (acc,curr) {
    acc += curr.get_dim(curr.itembb);
    return acc;
  };

  SpatialHelper.side = function (s) {
    return s.side;
  };
  SpatialHelper.dump = function (v) {
    return [v.get_pos(), v.get_dim()];
  };

  function _cleanSD (el) {
    el.destroy();
    el = null;
  }

  function cleanSpatialData (hash) {
    hash.spatial_data.forEach (_cleanSD.bind(null));
    hash.spatial_data = null;
  }

  function ListContainer(controller,path,options){
    DragAware.call(this,controller,path);
    this.el.set('clipPath',this.hotspot.el);
    this.tail = null;
    if(typeof options !== 'undefined' && typeof options !== 'object'){
      throw 'ListContainer expects options as a 3rd parameter';
    }
    this.orientation = null;
    this.set('orientation', options.orientation);

    this.lmp = {x: 0, y: 0};
    this.imp = {x: 0, y: 0};

    this.set('lmp', options.list_magnet_point);
    this.set('imp', options.item_magnet_point);

    this.cyclic = options ? !!options.cyclic : false;
    this.numberOfItems = null;
    this.set('numberOfItems', 0);
    this.animation = null;
    this.animationDoneListener = null;
    this.dragged_item = null;
    this.sticky = null;
    this.sticky_params = null;
    this.set('sticky_params', options.sticky);
    this.set('freeMove', false);
  }
  lib.inherit(ListContainer,DragAware);
  ListContainer.prototype.__cleanUp = function(){
    var tr = this._toArray();
    this.destroyAll();
    this.set('sticky_params', null);
    if (this.sticky) this.sticky.destroy();
    this.sticky = null;
    this.dragged_item = null;
    this.set('animation', null); //will clean up both listener and animation
    this.numberOfItems = null;
    this.cyclic = null;
    this.lmp = null;
    this.imp = null;
    this.orientation = null;
    this.tail = null;
    this.el.set('clipPath',null);
    DragAware.prototype.__cleanUp.call(this);
  };

  ///very expensive one, use with caution ...
  ListContainer.prototype._toArray = function () {
    if (!this.get('numberOfItems')) return[];
    var ret = [];
    this.traverse(toarr.bind(null, ret));
    return ret;
  };

  function toarr (ret, item) {
    ret.unshift(item);
  }

  function set_magnet_point (ref, val) {
    if (isNaN(val)) {
      if (!val) {
        ref.x = 0; ref.y = 0;
      }else{
        ref.x = isNaN(val.x) ? 0 : val.x;
        ref.y = isNaN(val.y) ? 0 : val.y;
      }
      return;
    }
    ref.x = val;
    ref.y = val;
  }

  //getters and setters ...
  ListContainer.prototype.set_imp = function (val) {
    set_magnet_point(this.imp, val);
  };

  ListContainer.prototype.set_lmp = function (val) {
    set_magnet_point(this.lmp, val);
  };

  ListContainer.prototype.set_sticky_params = function (val) {
    this.sticky_params = null;
    if (isNaN(val) && !val) return; /// not a zero and not a value (undefined or null) ...

    this.sticky_params = {
      x :0,
      y :0
    };
    if (isNaN(val)) {
      if (val.x && Sticky.isValidStickyConfigVal(val.x)) this.sticky_params.x = val.x;
      if (val.y && Sticky.isValidStickyConfigVal(val.y)) this.sticky_params.y = val.y;
    }else{
      if (Sticky.isValidStickyConfigVal(val)) {
        this.sticky_params.x = val;
        this.sticky_params.y = val;
      }
    }
  };
  ListContainer.prototype.set_dragged_item = function (val) {
    this.dragged_item = null;
    if (this.sticky) this.sticky.destroy();
    this.sticky = null;
    if (!val) return;
    this.dragged_item = val;
    if (this.sticky_params && Sticky.isValidStickyConfigVal(this.sticky_params.x) && Sticky.isValidStickyConfigVal(this.sticky_params.y)){
      this.sticky = new Sticky(val.boundingBox, this.moveEvaluator, this.sticky_params.x, this.sticky_params.y, 'slidetx', 'slidety');
    }
  };
  ListContainer.prototype.set_orientation = function (val) {
    this.orientation = val;
    if (val === ListContainer.LEFTTORIGHT) {
      this.allowDirection(DragAware.LEFT+DragAware.RIGHT);
    }else if (val === ListContainer.TOPTOBOTTOM) {
      this.allowDirection(DragAware.UP+DragAware.DOWN);
    }else{
      this.allowDirection(0);
    }
  };

  ListContainer.prototype.set_numberOfItems = function (val) {
    this.numberOfItems = val;
    this.set('enabled', !!val); //force boolean
  };

  ListContainer.prototype.set_enabled = function (val) {
    this.hotspot.el.set('display',val);
  };

  ListContainer.prototype.isHorizontal = function () {
    return this.orientation === ListContainer.LEFTTORIGHT;
  };

  ListContainer.prototype.getListMP = function () { //get lists magnet point
    return this.lmp ? ((this.isHorizontal()) ? this.lmp.x : this.lmp.y) : 0;
  };

  ListContainer.prototype.getItemMP = function () { //get items magnet point
    return this.imp ? ((this.isHorizontal()) ? this.imp.x : this.imp.y) : 0;
  };

  //operations methods ...
  ListContainer.prototype.add = function(item){
    var offset = [0,0],ibb=item.boundingBox.get();
    if(this.tail){
      //put initially tail to the right side of current tail ... 
      var tbb = this.tail.boundingBox.get();
      switch(this.orientation){
        case ListContainer.TOPTOBOTTOM:
          offset[1] = tbb[1]+tbb[3]-ibb[1];
          break;
        case ListContainer.LEFTTORIGHT:
          offset[0] = tbb[0]+tbb[2]-ibb[0];
          break;
      }
    }else{
      var al = this.getAlignmentLine(ibb);
      if (ListContainer.TOPTOBOTTOM === this.orientation) {
        offset[1] = al - ibb[1];
      }
      if (ListContainer.LEFTTORIGHT === this.orientation) {
        offset[0] = al - ibb[0];
      }
    }
    item.moveBy(offset);
    item.set('link',this.tail);
    if(this.tail && !item.link){
      throw item.id + ' not linked to ' + this.tail.id;
    }
    item.set('container', this);
    this.tail = item;
    this.set('numberOfItems',this.get('numberOfItems')+1);
    item.checkVisibility();
  };

  ListContainer.prototype.removeAll = function () {
    this.traverse(this.removeItem.bind(this));
  };

  ListContainer.prototype.removeItem = function(item){
    var bb = item.boundingBox.get();
    if (this.orientation === ListContainer.TOPTOBOTTOM) bb[2] = 0;
    if (this.orientation === ListContainer.LEFTTORIGHT) bb[3] = 0;
    var parent_list = this.detachItem(item);
    if (parent_list) {
      parent_list.forEach(this.moveItemBy.bind(this, -bb[2], -bb[3]));
    }
  };

  ListContainer.prototype.destroyAll = function () {
    lib.arryDestroyAll(this._toArray());
  };

  ListContainer.prototype.detachItem = function (item) {
    if (item.get('container') !== this) return; ///you're not in my list, get lost ...
    var parent_list = null;

    //do reconnection
    if(item===this.tail){
      this.tail = item.link; //conver one item left situation ... if everrything done properly ...
    }else{
      parent_list = this.getParent(item, true);
      var prnt = parent_list[parent_list.length-1];
      if (!prnt) throw 'Unable to find parent for item, list corrupted';
      prnt.set('link',item.get('link'));
    }
    item.set('link', null);
    item.set('container', null);
		this.set('numberOfItems',this.get('numberOfItems')-1);
    return parent_list;
  };

  ListContainer.prototype.getItem = function(itemindex){
    if(this.cyclic){
      if(itemindex>=this.numberOfItems){
        itemindex = itemindex%this.numberOfItems;
      }
      while(itemindex<=-2*this.numberOfItems){
        itemindex+=this.numberOfItems;
      }
    }
    var i = itemindex>=0 ? this.numberOfItems-itemindex-1 : -itemindex+1;
    var l = this.tail;
    while(i>0 && l){
      i--;
      l = l.link;
    }
    return i===0 ? l : null;
  };

  ListContainer.prototype._append_to_parent_list = function(acc,itm) {
    acc.push (itm);
  };
  ListContainer.prototype.getParent = function (item, list) {
    var acc = [];
    var ret = (item === this.tail) ? undefined : this.find({link: item}, (list) ? this._append_to_parent_list.bind(this,acc) : undefined );
    return list ? acc : ret;
  };

  //travers methods ...

  ListContainer.prototype.traverse = function(cb){
    if(!lib.isFunction(cb)){
      return;
    }
    var l = this.tail;
    while(l){
      cb(l);
      l = l.link;
    }
  };

  ListContainer.prototype.traverseConditionally = function(cb){
    if(!lib.isFunction(cb)){
      return;
    }
    var l = this.tail, res;
    while(l && 'undefined' === typeof res){
      res = cb(l);
      l = l.link;
    }
    return res;
  };

  /// do apply methods
  ListContainer.prototype.applyToAll = function(methodname){
    this.traverse(this.applyConditionally.bind(this,null,methodname,Array.prototype.slice.call(arguments,1)));
  };
  ListContainer.prototype.moveByAll = function (dx, dy) {
    if (this.cyclic) {
      this.applyToAll('moveBy', dx, dy);
      this.checkForCyclicRearrange();
    }else{
      this.applyToAll('moveBy', dx, dy);
    }
  };

  ListContainer.prototype.applyConditionally = function(skipitem,methodname,args,item){
    if(skipitem===item){
      return;
    }
    var method = item[methodname];
    if('function' !== typeof method){
      return;
    }
    method.apply(item,args);
  };

  ///manipulation methods ...
  ListContainer.prototype.tailToHead = function () {
    var item = this.tail;
    var head = this.getItem(0);
    this.removeItem(item);
    var ibb = item.boundingBox.get(), hbb = head.boundingBox.get();

    if (this.orientation === ListContainer.LEFTTORIGHT) {
      item.el.set('dtx', hbb[0]-ibb[0]-ibb[2]);
    }else{
      item.el.set('dty', hbb[1]-ibb[1]-ibb[3]);
    }
    this.set('numberOfItems',this.get('numberOfItems')+1);
    item.set('container',this);
    head.set('link', item);
    item.checkVisibility();
    return item;
  };
  ListContainer.prototype.headToTail = function () {
    var new_head = this.getItem(1);
    var head = new_head.link;
    this.detachItem(head);
    new_head.set('link', null);
    ListContainer.prototype.add.call(this, head);
  };
  ListContainer.prototype._item_spatial_data = function (acc, iteratecb, item) {
    var sh = new SpatialHelper(this.orientation, item.boundingBox.get(), acc.containerbb);
    acc.spatial_data.push(iteratecb ? iteratecb(sh, item, acc) : sh);
  };

  ListContainer.prototype.set_dslidetx = function (val) {
    this.moveByAll(val, 0);
  };

  ListContainer.prototype.set_dslidety = function (val) {
    this.moveByAll(0, val);
  };

  ListContainer.prototype.handleDrag = function(dx,dy){
    if (this.moveEvaluator && this.moveEvaluator.trend) {
      this.set('dslidety', dy);
      this.set('dslidetx', dx);
    }
  };

  ListContainer.prototype.isOnPosition = function () {
    return !this.get('animation');
  };
  ListContainer.prototype.set_animation = function (val) {
    if (!val) {
      if (this.animationDoneListener) this.animationDoneListener.destroy();
      if (this.animation) this.animation.destroy();
    }
    this.animationDoneListener = null;
    this.animation = null;
    if (!val) return;
    this.animation = val;
    this.animationDoneListener = this.animation.destroyed.attach (this.onAnimationDone.bind(this));
  };
  ListContainer.prototype.onAnimationDone = function () {
    this.set('animation', null);
    this.applyToAll('containerOnPosition');
  };

  ListContainer.prototype.onDragStart = function ()  {
    if (this.animation) this.animation.destroy();
    this.animation = null;
    DragAware.prototype.onDragStart.apply(this, arguments);
    this.set('dragged_item', this.containsVisionLine(this.isHorizontal()?this.hotspot.lastknownpos[0]:this.hotspot.lastknownpos[1]));
  };

  ListContainer.prototype.onDragEnd = function () {
    var shouldClick = !this.moveEvaluator.trend;
    DragAware.prototype.onDragEnd.apply(this, arguments);
    var dragged_item = this.get('dragged_item');
    if (shouldClick || !dragged_item) {
      return;
    }

    var sticky_decision = (this.sticky) ? this.sticky.decide() : undefined;

    if (mathlib.boundingBoxesOverlap(dragged_item.boundingBox.get(), this.boundingBox.get()) && sticky_decision) {
      if (sticky_decision.other) {
        this.set('d'+sticky_decision.other.axis, sticky_decision.other.amount);
      }
      this.set('animation', new Animator (this, {
        duration : sticky_decision.dur,
        props: sticky_decision.po
      }));
    }else {
      ///find closest one and go for it ...
      var closest = this.getClosestItem(),
        speed = this.moveEvaluator.speed || 1,
        dur = closest.abs/speed,
        props = {};

      props[this.isHorizontal() ? 'slidetx' : 'slidety'] = {amount:-closest.val};
      this.set('animation', new Animator(this, {
        duration: dur,
        props: props
      }));
    }
    this.set('dragged_item', null);
  };

  function _check_in_bb (point, sh,item) {
    return mathlib.pointInBoundingBox(point, sh.itembb) ? item : null;
  }

  ListContainer.prototype.shouldClick = function () {
    DragAware.prototype.shouldClick.apply(this, arguments);
    // ovo sve vreme i pokusavamo da izbegnemo, ali neka ga za sad  ...
    var item_at_pos = this.getItemsSpatialData(_check_in_bb.bind(null, this.hotspot.lastknownpos)).spatial_data.filter(to_bool)[0];
  };

  ListContainer.prototype.getItemsSpatialData = function (iteratecb) {
    var update_hash = {
      spatial_data: [],
      containerbb : this.boundingBox.get()
    };
    if ('function' !== typeof(iteratecb)) iteratecb = null;
    this.traverse(this._item_spatial_data.bind(this, update_hash, iteratecb));
    update_hash.spatial_data.reverse();
    return update_hash;
  };

  function get_items_distance(list, imp, lmp, sh, item, acc) {
    var dimp = sh.get_pos() + imp*sh.get_dim();
    var is_horizontal = list.isHorizontal();
    var llmp = SpatialHelper.get_pos(is_horizontal, acc.containerbb) + lmp*SpatialHelper.get_dim(is_horizontal, acc.containerbb);
    var diff = dimp - llmp;
    return  {
      sh : sh,
      item: item,
      abs: Math.abs(diff),
      val: diff
    };
  }
  
  function get_closest_item (acc, shi) {
    if (shi.abs >= acc.min) return;
    acc.min = shi.abs;
    acc.data = shi;
  }

  ListContainer.prototype.getClosestItem = function () {
    var acc = {min: Infinity, data:null};
    var sdata = this.getItemsSpatialData(get_items_distance.bind(null, this, this.getItemMP(), this.getListMP()));
    sdata.spatial_data.forEach (get_closest_item.bind(null, acc));
    return acc.data;
  };

  function rearange_cb (bacc, sh) {
    bacc.balance += sh.side;
    return sh;
  }

  ListContainer.prototype.checkForCyclicRearrange = function(){
    var cnt = 0;
    while (true) {
      cnt++;
      var horizontal = this.orientation === ListContainer.LEFTTORIGHT;
      var bacc = {balance : 0};
      var update_hash = this.getItemsSpatialData(rearange_cb.bind(null, bacc));
      var balance = bacc.balance;
      bacc = null;
      var current_index = update_hash.spatial_data.map(SpatialHelper.side).indexOf(0);
      if (balance > this.numberOfItems) {
        throw 'we have disbalance greater then numberOfItems? Not good. Balance '+balance+' numberOfItems '+this.numberOfItems;
      }
      var upper = Math.floor((this.numberOfItems - 1)/2),
        count = Math.abs(balance),
        remove_from = (balance < 0) ? 'head' : 'tail';

      cleanSpatialData(update_hash);
      if (count <= upper) {
        /*
        console.log('====>', JSON.stringify(this.getItemsSpatialData(function (sh, item, acc) {
          return {id:item.id, bb:sh.itembb};
        }).spatial_data));
        */
        return;
      }

      var to_remove = count-upper;

      while (to_remove) {
        if (remove_from === 'tail') { this.tailToHead(); }else{ this.headToTail(); }
        to_remove--;
      }
    }
  };

  ListContainer.prototype.getSpatialRefs = function () {
      var isd = this.getItemsSpatialData(),
      head = isd.spatial_data[0];
      if (!head) return undefined;
      
      var dimensions = head.itembb, ///initialize dimenisions with head bounding box....
      dim_index = this.horizontal ? 2 : 3,
      tail = isd.spatial_data[isd.spatial_data.length-1];
      dimensions[dim_index] = isd.spatial_data.reduce (SpatialHelper.add_dimension, 0);
      cleanSpatialData (isd);
      return dimensions;
  };

  ///about to become obsoleted ....
  ListContainer.prototype.containsVisionLine = function (pos) {
    var sd = this.getItemsSpatialData().spatial_data;
    if (!sd) return false;
    for (var i = 0; i<sd.length; i++) {
      var pl = sd[i].get_pos(sd[i].itembb);
      var pr = pl + sd[i].get_dim(sd[i].itembb);
      if (pos >= pl && pos < pr) {
        break;
      }
    }
    return this.getItem(i);
  };

  ListContainer.prototype.moveItemBy = function (dx, dy, item) {
    if (item) item.moveBy(dx, dy);
  };

  ListContainer.prototype.gotoItem = function (index) {
    var item = this.getIndex(index);
    var bb = item.boundingBox.get();
    this.moveByAll(-bb[0], bb[1]);
    return item;
  };

  //TODO: vidi jel si ovo radio jos negde u kodu ...
  ListContainer.prototype.getReferentPoint = function () {
    var mbb = this.boundingBox.get();
    var ret = [mbb[0], mbb[1]];

    if (ListContainer.TOPTOBOTTOM === this.orientation) {
      ret[1]+= (mbb[3]*this.lmp.y);
    }

    if (ListContainer.LEFTTORIGHT === this.orientation) {
      ret[0]+= (mbb[2]*this.lmp.x);
    }
    return ret;
  };
  
  ///ovo nije istina !!!
  ListContainer.prototype.getAlignmentLine = function (referent_item_bb, mbb) {
    if (!mbb) mbb = this.boundingBox.get();
    if (ListContainer.TOPTOBOTTOM === this.orientation) return (mbb[1]+(mbb[3] - referent_item_bb[3])*this.imp.y);
    if (ListContainer.LEFTTORIGHT === this.orientation) return (mbb[0]+(mbb[2] - referent_item_bb[2])*this.imp.x);
  };

  //query methods ...
  ListContainer.prototype.matchProp = function(item,propval,propname){
    if(item[propname]!==propval){
      return false;
    }
  };
  ListContainer.prototype.matchProps = function(prophash, prematch_cb, item){
    if (lib.isFunction(prematch_cb)){
      prematch_cb(item);
    }
    if(false!== lib.traverseConditionally(prophash,this.matchProp.bind(this,item))){
      return item;
    }
  };
  ListContainer.prototype.find = function(prophash, prematch_cb){
    return this.traverseConditionally(this.matchProps.bind(this,prophash, prematch_cb));
  };

  ListContainer.prototype.addItemId = function(dump,item){
    dump.unshift(item.id);
  };
  ListContainer.prototype.dumpItemIds = function(){
    var dump = [];
    this.traverse(this.addItemId.bind(this,dump));
    return dump;
  };

  ListContainer.TOPTOBOTTOM=1;
  ListContainer.LEFTTORIGHT=2;
  mylib.ListContainer = ListContainer;
}

module.exports = createListContainer;
