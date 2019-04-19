function createDynamicRepeater(lib, renderinglib, mylib) {
  'use strict';

  var ListContainer = mylib.ListContainer;
  function DynamicRepeater (controller, path, listsetup, prefix){
    ListContainer.call(this,controller, path, listsetup);
    this.dr_prefix = prefix || this.get('el').get('id');
    this.dr_regexp = new RegExp (this.dr_prefix+'_(\\d+)');
    this.dr_template = null;
  }
  lib.inherit(DynamicRepeater, mylib.ListContainer);
  DynamicRepeater.prototype.__cleanUp = function () {
    this.dr_prefix = null;
    this.dr_regexp = null;
    this.dr_template = null;
    ListContainer.prototype.__cleanUp.call(this);
  };

  DynamicRepeater.prototype.drClone = function(item, index) {
    renderinglib.clone(this.get('dr_template'), this.drOnElReady.bind(this, item), this.get('el'), this.get('dr_prefix')+'_'+index);
  };

  DynamicRepeater.prototype.drOnElReady = function (item,el) {
    el.show();
    el.tearOffUse(createItem.bind(null, this, item, el.get('id')));
  };

  function createItem (dr, item, parent_id, el) {
    var created = dr.drCreateItem(item, parent_id, el, dr.drGetElIndex(parent_id));
    if (created) dr.add(created);
  }

  DynamicRepeater.prototype.drCreateItem = function (item, parent_id, el, index){
    throw new Error('Not implemented');
  };

  DynamicRepeater.prototype.drClean = function () {
    var tail = this.get('tail');
    while (tail) {
      this.removeItem(tail);
      tail.destroy();
      tail = null;
      tail = this.get('tail');
    }
    this.get('el').getChildrenIDs().filter(_to_remove.bind(null, this)).forEach(_doremove.bind(null, this.get('el')));
  };

  function _to_remove (dr, id, index) {
    return id.match(dr.get('regex'));
  }

  function _doremove (el, id) {
    el.removeChild(el.childAtPath(id));
  }
  
  DynamicRepeater.prototype.drInit = function () {
    var prefix = this.get('dr_prefix');
    this.dr_template = this.get('el').childAtPath(prefix+'_0');
    this.dr_template.set('id', prefix+'_template');
    this.dr_template.hide();
    this.drClean();
  };

  DynamicRepeater.prototype.drGetElIndex = function (id) {
    return parseInt(id.match(this.dr_regexp)[1]);
  };

  DynamicRepeater.prototype.destroyAll = function () {
    var els = this._toArray().map(lib.doMethod.bind(lib, 'get', ['el']));
    ListContainer.prototype.destroyAll.call(this);
    lib.arryDestroyAll(els);
  };

  mylib.DynamicRepeater = DynamicRepeater;
}

module.exports = createDynamicRepeater;

