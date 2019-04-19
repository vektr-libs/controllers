function createSelectableButton(lib,mylib){
  'use strict';
  function SelectableButton(controller,path,enabled,selected,clickcb){
    this._selected = selected;
    mylib.Button.call(this,controller,path,enabled,clickcb);
    this.selected = null;
    this.registerSubEl('selected');
    this.show();
  }
  lib.inherit(SelectableButton,mylib.Button);
  SelectableButton.prototype.suffixForState = function(){
    if(/*this.state==='idle' &&*/ this._selected){
      return 'selected';
    }else{
      return mylib.Button.prototype.suffixForState.call(this);
    }
  };
  SelectableButton.prototype.set_selected = function(val){
    this._selected = val;
    this.show();
  };
  SelectableButton.prototype.get_selected = function(){
    return this._selected;
  };
  SelectableButton.prototype.clickedState = function(){
    return 'selected';
  };
  SelectableButton.prototype.onMouseClicked = function(){
    this._selected = true;
    mylib.Button.prototype.onMouseClicked.call(this);
  };
  mylib.SelectableButton = SelectableButton;
}

module.exports = createSelectableButton;
