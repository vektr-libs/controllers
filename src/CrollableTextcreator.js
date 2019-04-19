function createCrollableText(lib, modifierslib, mylib) {
  'use strict';
  var HotspotAware = mylib.HotspotAware , Animator = modifierslib.Animator;

  function CrollableText(controller, path, idle_alignment){
    HotspotAware.call(this, controller, path);
    var el = this.get('el');
    this.text_el = el.childAtPath(el.get('id')+'_text');
    this.set('text', '');
    el.set('clipPath', this.hotspot.el);
    this.animation = null;
    this._animation_destroyed_l = null;
    this.original_tmx = null;
    this.idle_alignment = idle_alignment || CrollableText.LEFT;
  }
  lib.inherit(CrollableText, HotspotAware);
  CrollableText.prototype.__cleanUp = function () {
    this.idle_alignment = null;
    this.resetAnimation();
    this.original_tmx = null;
    this.text_el = null;
    HotspotAware.prototype.__cleanUp.call(this);
  };
  CrollableText.LEFT = 'left';
  CrollableText.RIGHT ='right';
  CrollableText.CENTER = 'center';
  CrollableText.prototype.resetAnimation = function () {
    if(this._animation_destroyed_l) this._animation_destroyed_l.destroy();
    this._animation_destroyed_l = null;
    if(this.animation) this.animation.destroy();
    this.animation = null;
    this.text_el.transformMatrix[4] = this.original_tmx;
  };

  CrollableText.prototype.set_text = function (val) {
    this.text_el.set('text', val);
    var width = this.text_el.get('width');
    this.resetAnimation();
    var bbw = this.boundingBox.get()[2];
    if (this.original_tmx === null) {
      this.original_tmx = this.text_el.transformMatrix[4];
    }
    if (width > bbw){
      this._goForth(bbw-width-10);
    }else{
      switch (this.idle_alignment){
        case CrollableText.RIGHT: {
          this.text_el.transformMatrix[4] += bbw-width;
          this.text_el.__parent.childChanged();
          break;
        }
        case CrollableText.CENTER:{
          this.text_el.transformMatrix[4] += ((bbw-width)/2);
          this.text_el.__parent.childChanged();
          break;
        }
      }
    }
  };

  CrollableText.prototype.get_text = function (val) {
    return this.text_el.get('text');
  };

  CrollableText.prototype._goForth = function (amount) {
    this.resetAnimation();
    this.animation = new Animator(this.text_el, {
      props: {
        'tx': {amount:amount}
      },
      duration:2000
    });
    this._animation_destroyed_l = this.animation.destroyed.attach(this._goBack.bind(this, amount));
  };

  CrollableText.prototype._goBack = function (amount) {
    this.animation = null;
    this._animation_destroyed_l.destroy();
    this._animation_destroyed_l = null;
    this.animation = new Animator(this.text_el, {
      props: {
        tx: {amount: -amount}
      },
      duration: 500
    });
    this._animation_destroyed_l = this.animation.destroyed.attach(this._goForth.bind(this, amount));
  };

  mylib.CrollableText = CrollableText;
}

module.exports = createCrollableText;
