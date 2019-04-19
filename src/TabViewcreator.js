function createTabView(lib, mylib) {
  'use strict';
  var Controller = mylib.Controller, StateButton = mylib.StateButton;

  function createContent (tabview, content_id, value, index) {
    //NEKA GA ZA SAD OVAKO ... neka svaki content bude controller mada je to relativno glupo .... trebalo bi ovo malko sire da se osmisli ...
    ///TODO: index+'_content' moze da bude nedovoljno, treba content_id+'_'+index+'_content' !!!
    tabview.contents[index] = new value.ctor(tabview, value.path ? value.path : [content_id, index+'_tab_content'], value.settings);
  }

  function TabView (controller, path, state_buttons, default_tab, content_ctors) {
    Controller.call(this, controller, path);
    this.content_controls = new StateButton(this, [this.getControlsID(this.get('el'))], state_buttons, default_tab);
    this.contents = {};

    var content_id = this.getContentID();
    lib.traverse(content_ctors, createContent.bind(null, this, content_id));
    lib.traverse(this.contents, lib.doMethod.bind(lib, 'hide', null));
    this.current_content = null;

    this.content_group = this.get('el').childAtPath(this.getContentID());
    this.content_group.__children.traverse(lib.doMethod.bind(lib, 'hide', null));

    this._cc_l  = this.content_controls.attachListener('changed', 'state', this._onButtonStateChanged.bind(this));
    this._onButtonStateChanged(this.content_controls.get('state'));
  }
  lib.inherit(TabView, Controller);
  TabView.prototype.__cleanUp = function () {
    lib.objDestroyAll(this.contents);
    this._cc_l.destroy();
    this._cc_l = null;
    this.content_controls.destroy();
    this.content_controls = null;
    this.content_group = null;
    Controller.prototype.__cleanUp.call(this);
  };

  TabView.prototype._onButtonStateChanged = function (state) {
    if (this.current_content) this.current_content.hide();
    this.current_content = this.contents[state];
    if (!this.current_content) throw new Error('Invalid state '+state);
    this.current_content.show();
  };
  TabView.prototype.getContentID = function (el) {
    return this.get('el').get('id')+'_content';
  };

  TabView.prototype.getContent = function (state) {
    return this.contents && state in this.contents ? this.contents[state] : null;
  };

  TabView.prototype.getControlsID  = function () {
    return this.get('el').get('id')+'_tabs';
  };

  TabView.prototype.disableState = function (state) {
    this.content_controls.disableState(state);
  };

  TabView.prototype.enableState = function (state) {
    this.content_controls.enableState(state);
  };

  TabView.prototype.set_state = function (state) {
    this.content_controls.set('state', state);
  };

  TabView.prototype.get_state = function () {
    return this.content_controls.get('state');
  };
  mylib.TabView = TabView;

}

module.exports = createTabView;
