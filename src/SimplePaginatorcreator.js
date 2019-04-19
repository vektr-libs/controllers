function createSimplePaginator(lib,mylib){
  'use strict';

  var Controller = mylib.Controller,
    UseButton = mylib.UseButton;


  ///TODO: refactor this in order to get config free class ... convention over configuration !!!

  function SimplePaginator (controller, path, config) {
    Controller.call(this, controller, path);
    this.config = config;
    this.page = null;
    this.total = null;
    this.value = this.get('el').childAtPath(config.page_value_id);

    this.prevb = new UseButton(this, config.prev_button, false, this._prev.bind(this));
    this.nextb = new UseButton(this, config.next_button, false, this._next.bind(this));
    this.set_page(null);
  }
  lib.inherit(SimplePaginator, Controller);
  SimplePaginator.prototype.__cleanUp = function () {
    this.config = null;
    this.page = null;
    this.total = null;
    this.value = null;

    this.prevb.destroy();
    this.prevb = null;
    this.nextb.destroy();
    this.nextb = null;

    Controller.prototype.__cleanUp.call(this);
  };

  SimplePaginator.prototype.set_total = function (val) {
    val = val || 0;
    ///nije mi bas najjasniji ovaj if ...
    if (val < 2 || val < this.total) {
      this.set('page', null);
      this.set('page', 0);
    }
    this.total = val;
    this.set('page', null);
    this.set('page', 0);
  };

  SimplePaginator.prototype.set_page = function (val) {
    this.page = val;
    this.get('el').set('display', (this.total || 0) > 1);
    this.value.set('text', (this.get('page')+1)+'/'+this.get('total'));
    this.setButtons();
  };

  SimplePaginator.prototype.setButtons = function () {
    if (!this.prevb || !this.nextb) return;

    var prevb_on = !!this.page, nextb_on = !isNaN(this.page) && this.page+1 < this.total;
    this.prevb.set('enabled', prevb_on);
    this.prevb.set('display', prevb_on);
    this.nextb.set('enabled', nextb_on);
    this.nextb.set('display', nextb_on);
  };

  SimplePaginator.prototype._prev = function (){
    this.set('page', this.get('page')-1);
  };

  SimplePaginator.prototype._next = function () {
    this.set('page', this.get('page')+1);
  };

  mylib.SimplePaginator = SimplePaginator;
}

module.exports = createSimplePaginator;
