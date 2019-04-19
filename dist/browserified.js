(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var lr = ALLEX.execSuite.libRegistry;
lr.register('vektr_controllerslib',
  require('./index')(
    ALLEX,
    lr.get('allex_hierarchymixinslib'),
    lr.get('vektr_modifierslib'),
    lr.get('vektr_commonlib'),
    lr.get('vektr_renderinglib'),
    lr.get('vektr_mathlib')
  )
);

},{"./index":2}],2:[function(require,module,exports){
function createLib (execlib, hierarchymixinslib, modifierslib, commonlib, renderinglib, mathlib) {
  'use strict';

  var lib = execlib.lib;
  var ret = {
    util : {}
  };

  require('./src/utilcreator')(lib, ret);
  require('./src/EventDispatchercreator')(lib, ret);
  require('./src/Environmentcreator')(lib, hierarchymixinslib, ret);
  require('./src/MouseEnvironmentcreator')(lib, ret);
  require('./src/ChildMouseEnvironmentcreator')(lib, ret);
  require('./src/DataEnvironmentcreator')(lib, ret);
  require('./src/Controllercreator')(lib, hierarchymixinslib, modifierslib, commonlib, renderinglib, ret);
  require('./src/AreaAwarecreator')(lib, renderinglib, commonlib, mathlib, ret);
  require('./src/RelativePositionListenercreator')(lib, ret);
  require('./src/HotspotAwarecreator')(lib, ret);
  require('./src/DragAwarecreator')(lib, ret);
  require('./src/Draggablecreator')(lib, modifierslib, mathlib, ret);
  require('./src/Constrainercreator')(lib, ret);
  require('./src/ListContainercreator')(lib, modifierslib, mathlib, renderinglib.algorithms, ret);
  require('./src/ListItemcreator')(lib, mathlib, ret);
  require('./src/Standalonecreator')(lib, commonlib, renderinglib, ret);
  require('./src/Mousecreator')(lib, commonlib, mathlib, renderinglib, ret);
  require('./src/Slidercreator')(lib, ret);
  require('./src/Buttoncreator')(lib, ret);
  require('./src/ToggleButtoncreator')(lib, ret);
  require('./src/SelectableButtoncreator')(lib, ret);
  require('./src/DataAwarecreator')(lib, ret);
  require('./src/StateButtoncreator')(lib, renderinglib, ret);
  require('./src/TabViewcreator')(lib, ret);
  require('./src/DynamicRepeatercreator')(lib, renderinglib, ret);
  require('./src/ModalStandalonecreator')(lib, ret);
  require('./src/SvgMouseEnvironmentcreator')(lib, hierarchymixinslib, ret);
  require('./src/CrollableTextcreator')(lib, modifierslib, ret);
  require('./src/SimplePaginatorcreator')(lib, ret);

  return ret;
}

module.exports = createLib;

},{"./src/AreaAwarecreator":3,"./src/Buttoncreator":4,"./src/ChildMouseEnvironmentcreator":5,"./src/Constrainercreator":6,"./src/Controllercreator":7,"./src/CrollableTextcreator":8,"./src/DataAwarecreator":9,"./src/DataEnvironmentcreator":10,"./src/DragAwarecreator":11,"./src/Draggablecreator":12,"./src/DynamicRepeatercreator":13,"./src/Environmentcreator":14,"./src/EventDispatchercreator":15,"./src/HotspotAwarecreator":16,"./src/ListContainercreator":17,"./src/ListItemcreator":18,"./src/ModalStandalonecreator":19,"./src/MouseEnvironmentcreator":20,"./src/Mousecreator":21,"./src/RelativePositionListenercreator":22,"./src/SelectableButtoncreator":23,"./src/SimplePaginatorcreator":24,"./src/Slidercreator":25,"./src/Standalonecreator":26,"./src/StateButtoncreator":27,"./src/SvgMouseEnvironmentcreator":28,"./src/TabViewcreator":29,"./src/ToggleButtoncreator":30,"./src/utilcreator":31}],3:[function(require,module,exports){
function createAreaAware(lib,renderinglib,commonlib,mathlib,mylib){
  'use strict';

/**
* Adds a listener on given element properties.
* @constructor BoundingBoxProperty
* @augments LazyListener
* @param {Array} neededtargetnames - Array of element properties to listen
* @private
*/
  function BoundingBoxProperty(neededtargetnames){
    commonlib.LazyListener.call(this,neededtargetnames);
  }
  lib.inherit(BoundingBoxProperty,commonlib.LazyListener);

/**
* Calculates the values related to the element's position (x, y, x+width, y+height).
* Returns a matrix in the following form [[x, y], [x+width, y+height]].
* @method calculateValue
* @instance
* @memberof BoundingBoxProperty
*/
  BoundingBoxProperty.prototype.calculateValue = function(){
    return mathlib.boundingBoxInSpace(this.targets.content.prop.boundingBox(),this.targets.transformMatrix.get());
  };

/**
* Gains knowledge about the hotspot of an element and recalculates it's position in the coordinate system as and if it changes position. 
* @constructor AreaAware
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function AreaAware(controller,path){
    mylib.Controller.call(this,controller,path);
    this.content = null;
    this.transformMatrix = new commonlib.MatrixStack(mylib.util.transformMatrixStackFromController(this));
    var shape = this.el;
    while(shape && !(shape instanceof renderinglib.Shape)){
      shape = shape.el;
    }
    if(!shape){
      throw new Error('No shape in '+this.el.id);
    }else{
      this.content = shape.content;
    }
    this.boundingBox = new BoundingBoxProperty(['content','transformMatrix']);
    this.boundingBox.add('content',this.content);
    this.boundingBox.add('transformMatrix',this.transformMatrix);
    this.boundinBoxChangedListener = this.boundingBox.changed.attach(this.onBoundingBoxChanged.bind(this));
  }
  lib.inherit(AreaAware,mylib.Controller);
/**
* Fires the "boundingbox" event
* @method onBoundingBoxChanged
* @instance
* @memberof AreaAware
*/
  AreaAware.prototype.onBoundingBoxChanged = function(){
    this.fireEvent('boundingBox',true);
  };
/**
* Cleans up and removes all properties of an AreaAware Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof AreaAware
*/
  AreaAware.prototype.__cleanUp = function(){
    this.boundinBoxChangedListener.destroy();
    this.boundinBoxChangedListener = null;
    this.boundingBox.destroy();
    this.boundingBox = null;
    this.transformMatrix.destroy();
    this.transformMatrix = null;
    this.content = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  mylib.AreaAware = AreaAware;
}

module.exports = createAreaAware;

},{}],4:[function(require,module,exports){
function createButton(lib,mylib){
  'use strict';
  var Controller = mylib.Controller;

/**
* Creates a button on a given element. Every button must have four states (enabled, hovered, pressed and disabled) and a hotspot that defines the area that the button occupies.
* @constructor Button
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
* @param {Boolean} enabled - Button state (enabled or disabled)
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
*/
  function Button(controller,path,enabled,clickcb, lpcb){
    Controller.call(this,controller,path);
    this.hotspot = new mylib.Mouse(this,[this.el.hotspotChildId()]);
    this.hotspot.attachListener('mousein',this.onMouseIn.bind(this));
    this.hotspot.attachListener('mouseout',this.onMouseOut.bind(this));
    this.hotspot.attachListener('mousepressed',this.onMousePressed.bind(this));
    this.hotspot.attachListener('clicked',this.onMouseClicked.bind(this));
    this.hotspot.attachListener('longpress', this.onLongPress.bind(this));
    this.clickcb = 'function'===typeof clickcb ? clickcb : null;
    this.lpcb = 'function' === typeof lpcb ? lpcb : null;
    this.subelnames = [];
    this.hovered = null;
    this.enabled = null;
    this.disabled = null;
    this.pressed = null;
    this.state = 'idle';
    this.registerSubEl('hovered');
    this.registerSubEl('enabled');
    this.registerSubEl('disabled');
    this.registerSubEl('pressed');
    this.isEnabled = enabled;
    this.show();
  }
  lib.inherit(Button,Controller);
  Button.prototype.set = lib.Changeable.prototype.set;

/**
* Gets the element in SVG that represents a button state 
* by the given suffix (enabled, hovered, pressed or disabled).
* If such state exists, it is pushed in an array of button state elements.
* @method registerSubEl
* @param {String} idsuffix - Suffix that defines the button state (enabled, hovered, pressed, disabled)
* @instance
* @memberof Button
*/
  Button.prototype.registerSubEl = function(idsuffix,elname){
    var id = this.el.id+'_'+idsuffix;
    var ch = this.el.childById(id);
    if(ch){
      this[idsuffix] = ch;
      this.subelnames.push(idsuffix);
    }
  };

/**
* Shows the element that represents a button state, if such button state exists,
* i.e. if it is registered for the Button element.
* @method showSubEl
* @param {String} targetsuffix -  Suffix (button state) of the element that should be shown.
* @param {String} subelidsuffix - Suffix (button state) from the array of registered 
* button states for the Button object.
* @instance
* @memberof Button
*/
  Button.prototype.showSubEl = function(targetsuffix,subelidsuffix){
    var subel = this[subelidsuffix];
    if(targetsuffix===subelidsuffix){
      //console.log(this.id,'showing',targetsuffix);
      subel.show();
    }else{
      subel.hide();
    }
  };

/**
* Returns the current button state if Button is enabled. 
* Otherwise it returns the 'disabled' state of the Button.
* @method suffixForState
* @instance
* @memberof Button
* @returns {String} Button state (suffix) - enabled, hovered, pressed or disabled
*/
  Button.prototype.suffixForState = function(){
    switch(this.state){
      case 'idle':
        return this.isEnabled ? 'enabled' : 'disabled';
      case 'hovered':
        return this.isEnabled ? 'hovered' : 'disabled';
      case 'pressed':
        return this.isEnabled ? 'pressed' : 'disabled';
    }
  };

/**
* Sets the button state that should be shown, unless the Button is disabled. 
* @method set_state
* @param {String} state - Button state that you want to show (suffix) - enabled, hovered, pressed or disabled.
* @instance
* @memberof Button
*/
  Button.prototype.set_state = function(state){
    this.state = state;
    if(!this.isEnabled){
      return false;
    }
    this.show();
  };

/**
* Shows the Button object with it's current state. 
* @method show
* @instance
* @memberof Button
*/
  Button.prototype.show = function(){
    var idsuffix = this.suffixForState();
    //console.log('Button showing',idsuffix);
    this.subelnames.forEach (this.showSubEl.bind(this,idsuffix));
    Controller.prototype.show.call(this);
  };

/**
* Changes the Button state to 'hovered'. 
* @method onMouseIn 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseIn = function(){
    if(this.isEnabled){
      this.set('state','hovered');
    }
  };

/**
* Changes the Button state to 'idle'. 
* @method onMouseOut 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseOut = function(){
    if(this.isEnabled){
      this.set('state','idle');
    }
  };

/**
* Changes the Button state to 'pressed'. 
* @method onMousePressed 
* @instance
* @memberof Button
*/
  Button.prototype.onMousePressed = function(){
    if(this.isEnabled){
      this.set('state','pressed');
    }
  };

/**
* Returns the Button state - 'hovered' or 'idle' -
* depending on whether the cursor is placed over the Button element.
* @method clickedState 
* @instance
* @memberof Button
* @returns {String} Button state - 'hovered' or 'idle'
*/
  Button.prototype.clickedState = function(){
    return this.hotspot.hovered?'hovered':'idle';
  };

/**
* Executes the callback function when the Button is clicked.
* @method onMouseClicked 
* @instance
* @memberof Button
*/
  Button.prototype.onMouseClicked = function(){
    this._doCB(this.clickcb);
  };

/**
* Executes the callback function when the Button is long pressed.
* @method onLongPress 
* @instance
* @memberof Button
*/
  Button.prototype.onLongPress = function () {
    this._doCB(this.lpcb);
  };

/**
* Executes the given callback function when the Button is pressed.
* @method _doCB 
* @param {Function} cb - Callback function to execute on button press.
* @instance
* @private
* @memberof Button
*/
  Button.prototype._doCB = function(cb) {
    if(this.isEnabled && this.get('state') === 'pressed'){
      this.set('state',this.clickedState());
      if(cb){
        cb(this);
      }
    }
  };

/**
* Cleans up and removes all properties of a Button Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof Button
*/
  Button.prototype.__cleanUp = function(){
    this.lpcb = null;
    this.isEnabled = null;
    this.state = null;
    this.pressed = null;
    this.disabled = null;
    this.enabled = null;
    this.hovered = null;
    this.subelnames = null;
    this.clickcb = null;
    this.hotspot.destroy();
    this.hotspot = null;
    this.id = null;
    Controller.prototype.__cleanUp.call(this);
  };

/**
* Returns whether the Button is enabled or not.
* @method get_enabled 
* @instance
* @memberof Button
* @returns {Boolean}
*/
  Button.prototype.get_enabled = function(){
    return this.isEnabled;
  };

/**
* Sets the Button state to enabled and shoes the Button.
* @method set_enabled 
* @instance
* @memberof Button
*/
  Button.prototype.set_enabled = function(val){
    this.isEnabled = val;
    this.show();
  };

/**
* Sets the 'enabled' Button property to true.
* @method enable 
* @instance
* @memberof Button
*/
  Button.prototype.enable = function(){
    this.set('enabled',true);
  };

/**
* Sets the 'enabled' Button property to false.
* @method disable 
* @instance
* @memberof Button
*/
  Button.prototype.disable = function(){
    this.set('enabled',false);
  };

  function nextChild(obj,pathel){
    obj.el = obj.el.childById(pathel);
  }

/**
* Creates a Button on a given element that is a USE instance of a group representing a button (that has four states (enabled, hovered, pressed and disabled) and a hotspot that defines the area that the button occupies).
* @constructor UseButton
* @augments Controller
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
* @param {Boolean} enabled - Button state (enabled or disabled)
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
*/
  function UseButton (controller, path, enabled, clickcb, lpcb) {
    Controller.call(this, controller, path);
    this.enabled = enabled;
    this._use_button = null;
    this.get('el').tearOffUse(this._ub_onCreated.bind(this, clickcb, lpcb));
  }

  lib.inherit(UseButton, Controller);

/**
* Cleans up and removes all properties of a UseButton Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof UseButton
*/
  UseButton.prototype.__cleanUp = function () {
    this.enabled = null;
    if (this._use_button) this._use_button.destroy();
    this._use_button = null;
    Controller.prototype.__cleanUp.call(this);
  };

/**
* Creates an instance of a {@link Button} on a given element 
* and sets it to '_use_button' property of UseButton.
* @method _ub_onCreated
* @param {Function} clickcb - On click callback function
* @param {Function} lpcb - On long press callback function
* @param {object} group - Group instance 
* @instance
* @private
* @memberof UseButton
*/
  UseButton.prototype._ub_onCreated = function (clickcb, lpcb, group){
    if (!this.destroyed) return;
    group.show();
    this.set('_use_button', new Button(this, [group.get('id')], this.get('enabled'), clickcb, lpcb));
  };

/**
* Returns the value of the 'enabled' property of UseButton.
* @method get_enabled
* @instance
* @memberof UseButton
*/
  UseButton.prototype.get_enabled = function () {
    return this.enabled;
  };

/**
* Sets the UseButton 'enabled' property to true or false.
* @method set_enabled
* @param {Boolean} val - Button state enabled or not
* @instance
* @memberof UseButton
*/
  UseButton.prototype.set_enabled = function (val) {
    this.enabled = val;
    if (this._use_button) this._use_button.set('enabled', val);
  };

/**
* Sets the UseButton 'enabled' property to true.
* @method enable
* @instance
* @memberof UseButton
*/
  UseButton.prototype.enable = function () {
    this.set('enabled', true);
  };

/**
* Sets the UseButton 'enabled' property to false.
* @method disable
* @instance
* @memberof UseButton
*/
  UseButton.prototype.disable = function () {
    this.set('enabled', false);
  };


  ///use this type of button for patterns like: i have a background which is use, and something above which is button label
  function BackgroundButton (controller, path, enabled, clickcb, lpcb, backgroundid) {
    Controller.call(this, controller, path);
    this._button = null;
    this.disabled = !enabled;
    var el = this.get('el');

    var chld = backgroundid ? el.childAtPath(backgroundid) : el.childAtPath('{BACKGROUND}_background', {BACKGROUND: this.get('el').get('id')});
    if (!chld) return;
    chld.tearOffUse(this._onBckgReady.bind(this, chld, clickcb, lpcb));

  }
  lib.inherit(BackgroundButton, Controller);

  BackgroundButton.prototype.__cleanUp = function () {
    this.disabled = null;
    if (this._button) this._button.destroy();
    this._button = null;
    Controller.prototype.__cleanUp.call(this);
  };

  BackgroundButton.prototype._onBckgReady = function (chld, clickcb, lpcb, el) {
    el.show();
    this._button = new Button(this, [child.get('id'), el.get('id')], !this.disabled, clickcb, lpcb);
  };

  BackgroundButton.prototype.show = function () {
    if (this._button) this._button.show();
    Controller.prototype.show.call(this);
  };

  BackgroundButton.prototype.hide = function () {
    if (this._button) this._button.hide();
    Controller.prototype.hide.call(this);
  };

  BackgroundButton.prototype.get_enabled = function () {return !this.disabled;};

  BackgroundButton.prototype.set_enabled = function (val) {
    this.disabled = !val;
    if (this._button) this._button.set('enabled', val);
  };

  BackgroundButton.prototype.enable = function () {
    this.set('enabled', true);
  };

  BackgroundButton.prototype.disable = function () {
    this.set('enabled', false);
  };

  mylib.Button = Button;
  mylib.UseButton = UseButton;
  mylib.BackgroundButton = BackgroundButton;
}

module.exports = createButton;

},{}],5:[function(require,module,exports){
function createChildMouseEnvironment(lib,mylib){
  'use strict';
/**
* Creates an environment on a canvas instance, catches and dispatches mouse events.
* @constructor ChildMouseEnvironment
* @param {Object} canvas - Canvas instance
* @augments MouseEnvironment
* @augments Gettable
*/
  function ChildMouseEnvironment(canvas){
    lib.Gettable.call(this);
    mylib.MouseEnvironment.call(this,canvas);
    this.pressed = false;
  }

  lib.inherit(ChildMouseEnvironment,mylib.MouseEnvironment);

/**
*
* @method get
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.get = lib.Gettable.prototype.get;

/**
* Catches and dispatches Mouse Down event
* @method down
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.down = function(evnt){
    this.pressed = (mylib.MouseEnvironment.prototype.down.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Touched event
* @method touched
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.touched = function(evnt){
    this.pressed = (mylib.MouseEnvironment.prototype.touched.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Moved event
* @method moved
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.moved = function(evnt){
    this.pressed &= (mylib.MouseEnvironment.prototype.moved.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse TouchMoved event
* @method touchmoved
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.touchmoved = function(evnt){
    this.pressed &= (mylib.MouseEnvironment.prototype.touchmoved.call(this,evnt)>0);
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Untouched event
* @method untouched
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.untouched = function(evnt){
    mylib.MouseEnvironment.prototype.untouched.call(this,evnt);
    this.pressed = false;
    return this.pressed;
  };

/**
* Catches and dispatches Mouse Up event
* @method up
* @instance
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.up = function(evnt){
    mylib.MouseEnvironment.prototype.up.call(this,evnt);
    this.pressed = false;
    return this.pressed;
  };

/**
* Cleans up and removes all properties of a ChildMouseEnvironment Object declared in the constructor.
* @method __cleanUp
* @instance
* @private
* @memberof ChildMouseEnvironment
*/
  ChildMouseEnvironment.prototype.__cleanUp = function(){
    this.pressed = null;
    mylib.MouseEnvironment.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
  };

  mylib.ChildMouseEnvironment = ChildMouseEnvironment;

}

module.exports = createChildMouseEnvironment;

},{}],6:[function(require,module,exports){
function createConstrainer(lib,mylib){
  'use strict';
/**
* 
* @constructor Constrainer
* @augments AreaAware
* @param {Controller} controller - Controller instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function Constrainer(controller,path){
    mylib.AreaAware.call(this,controller,path);
  }

  lib.inherit(Constrainer,mylib.AreaAware);

/**
* 
* @method clipValue
* @param {Number} v 
* @param {Number} clip
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.clipValue = function(v,clip){
    if(clip===0){
      return 0;
    }
    if(clip>0){
      if(v<clip){
        if(v<0){
          return 0;
        }else{
          return v;
        }
      }else{
        return clip;
      }
    }else{
      if(v>clip){
        if(v>0){
          return 0;
        }else{
          return v;
        }
      }else{
        return clip;
      }
    }
  };

/**
* 
* @method willFitHorizontally 
* @param {Object} otherareaaware 
* @param {Number} dx - X coordinate
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.willFitHorizontally = function(otherareaaware,dx){
    if(dx===0){return 0;}
    var bb = this.boundingBox.get(), obb = otherareaaware.boundingBox.get();
    if(dx>0){
      return this.clipValue(bb[0]+bb[2]-obb[0]-obb[2],dx);
    }else{
      return this.clipValue(bb[0]-obb[0],dx);
    }
  };

/**
* 
* @method willFitVertically 
* @param {Object} otherareaaware 
* @param {Number} dy - Y coordinate
* @instance
* @returns {Number}
* @memberof Constrainer
*/
  Constrainer.prototype.willFitVertically = function(otherareaaware,dy){
    if(dy===0){return 0;}
    var bb = this.boundingBox.get(), obb = otherareaaware.boundingBox.get();
    if(dy>0){
      return this.clipValue(bb[1]+bb[3]-obb[1]-obb[3],dy);
    }else{
      return this.clipValue(bb[1]-obb[1],dy);
    }
  };

/**
* 
* @method willFit 
* @param {Object} otherareaaware 
* @param {Number} dx
* @param {Number} dy
* @instance
* @returns {Array}
* @memberof Constrainer
*/
  Constrainer.prototype.willFit = function(otherareaaware,dx,dy){
    return [this.willFitHorizontally(otherareaaware,dx),this.willFitVertically(otherareaaware,dy)];
  };

/**
* Cleans up and removes all properties of a Constrainer Object 
* @method __cleanUp
* @instance
* @private
* @memberof Constrainer
*/
  Constrainer.prototype.__cleanUp = function(){
    mylib.AreaAware.prototype.__cleanUp.call(this);
  };
  mylib.Constrainer = Constrainer;
}

module.exports = createConstrainer;

},{}],7:[function(require,module,exports){
function createController(lib,hierarchymixinslib,modifierslib,commonlib,renderinglib,mylib){
  'use strict';
  //TODO: this.parentsChanged currently assumes a static parent-child hierarchy,
  //a dynamic hierarchy support would be nice...

/**
* 
* @constructor Controller
* @augments Modifier
* @augments Gettable
* @param {Object} elorcontroller - Object instance
* @param {String | Array} path - Path to an element in SVG file. If this parameter is a String, then it's value is a dot-separated path to an element.
*/
  function Controller(elorcontroller,path){
    if(!(typeof path === 'object' && path instanceof Array)){
      throw new Error('path missing for the Controller constructor');
    }
    var stack = mylib.util.stackFromElorControllerAndPath(elorcontroller,path);
    this.active = new commonlib.ANDStackedProperty('display',stack);
    lib.Changeable.call(this);
    lib.Listenable.call(this);
    lib.Gettable.call(this);
    var el = this.active.stack[this.active.stack.length-1];
    modifierslib.Modifier.call(this,el);
    this.id = this.el.id+'_controller';
    hierarchymixinslib.DestroyableChild.call(this);
    this.activeChangedListener = this.active.changed.attach(this.onActiveChanged.bind(this));
  }

  lib.inherit(Controller,modifierslib.Modifier);

/**
* Cleans up and removes all properties of an Controller Object.
* @method __cleanUp
* @instance
* @private
* @memberof Controller
*/
  Controller.prototype.__cleanUp = function(){
    this.activeChangedListener.destroy();
    this.activeChangedListener = null;
    hierarchymixinslib.DestroyableChild.prototype.__cleanUp.call(this);
    this.id = null;
    modifierslib.Modifier.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Listenable.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
    this.active.destroy();
    this.active = null;
  };

/**
* @method get 
* @instance
* @memberof Controller
*/
  Controller.prototype.get = lib.Gettable.prototype.get;

/**
* @method get_active 
* @instance
* @memberof Controller
*/
  Controller.prototype.get_active = function(){
    return this.active ? this.active.get() : false;
  };

/**
* @method get_display
* @instance
* @memberof Controller
*/
  Controller.prototype.get_display = function(){
    return this.get('active');
  };

/**
* @method onActiveChanged 
* @instance
* @memberof Controller
*/
  Controller.prototype.onActiveChanged = function(){
    this.fireEvent('display',this.active.get());
  };

/**
* @method fireEvent
* @instance
* @memberof Controller
*/
  Controller.prototype.fireEvent = lib.Changeable.prototype.fireEvent;
  /*
  Controller.prototype.fireEvent = function(){
    lib.Changeable.prototype.fireEvent.apply(this,arguments);
    this.el.fireEvent('controller',this.id);
  };
  */

/**
* @method attachListener
* @instance
* @memberof Controller
*/
  Controller.prototype.attachListener = modifierslib.Modifier.prototype.attachListener;

/**
* Returns a child element of a given element by the given ID.
* @method childById
* @param {String} id - ID of an element
* @instance
* @memberof Controller
* @returns {Object}
*/
  Controller.prototype.childById = function(id){
    return this.el.childById(id);
  };

/**
* @method hotspotChildId
* @instance
* @memberof Controller
*/
  Controller.prototype.hotspotChildId = function(){
    return this.el.hotspotChildId();
  };

/**
* @method hotspotChildId
* @instance
* @memberof Controller
*/
  Controller.prototype.hotspotChild = function(){
    return this.el.hotspotChild();
  };

/**
* @method svgEl
* @instance
* @memberof Controller
*/
  Controller.prototype.svgEl = function(){
    var ret = this.active.stack[0];
    while(ret.active && ret.active.stack){
      ret = ret.active.stack[0];
    }
    if(ret.__parent instanceof renderinglib.SvgLayer){
      return ret.__parent;
    }
    return ret;
  };

  function toLocalSpace(m,stackel){
    stackel.toLocalSpace(m);
  }

/**
* @method toLocalSpace
* @param m
* @instance
* @memberof Controller
*/
  Controller.prototype.toLocalSpace = function(m){
    this.active.stack.forEach(toLocalSpace.bind(null,m));
  };

/**
* @method get_layer
* @instance
* @memberof Controller
*/
  Controller.prototype.get_layer = function(){
    return this.svgEl().__parent;
  };

/**
* @method scene
* @instance
* @memberof Controller
*/
  Controller.prototype.scene = function(){
    return this.get('layer').__parent;
  };

/**
* @method theater
* @instance
* @memberof Controller
*/
  Controller.prototype.theater = function(){
    var svg = this.svgEl();
    if(svg instanceof renderinglib.Svg){
      return svg.__parent;
    }
    if(svg instanceof renderinglib.SvgLayer){
      return svg.__parent.__parent.__parent;
    }
    return this.scene().__parent;
  };
  mylib.Controller = Controller;
}

module.exports = createController;

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
function createDraggable(lib,modifierslib,mathlib,mylib){
  'use strict';
  function Sticky(draggable,decisionpercx,decisionpercy,boundingwindow){
    if(decisionpercx<0||decisionpercy<0){
      throw "Sticky's decision percentage cannot be <0";
    }
    this.draggable = draggable;
    this.initialBB = boundingwindow || this.draggable.boundingBox.get();
    this.decisionpercx = decisionpercx;
    this.decisionpercy = decisionpercy;
    this.animator = null;
    this.animatorDestroyedListener = null;
    this.draggableMovedListener = null;
  }
  Sticky.prototype.destroy = function(){
    this.detachMovedListener();
    this.set('animator',null);
    this.decisionpercy = null;
    this.decisionpercx = null;
    this.initialBB = null;
    this.draggable = null;
  };
  Sticky.prototype.set = lib.Settable.prototype.set;
  Sticky.prototype.detachMovedListener = function(){
    if(this.draggableMovedListener){
      this.draggableMovedListener.destroy();
    }
    this.draggableMovedListener = null;
  };
  Sticky.prototype.set_animator = function(val){
    if(this.animator){
      this.animatorDestroyedListener.destroy();
      this.animatorDestroyedListener = null;
      this.animator = null;
    }
    if(val && val.destroyed){
      this.animator = val;
      this.animatorDestroyedListener = this.animator.destroyed.attach(this.animatorDone.bind(this));
    }
  };
  Sticky.prototype.animatorDone = function(){
  	
    this.set('animator',null);
    //var isc = this.isStickyControllable();
    var isc = mathlib.boundingBoxesOverlap(this.draggable.boundingBox.get(), this.initialBB);
    this.draggable.set('enabled',isc);
    if(!isc){
      this.detachMovedListener();
      this.draggableMovedListener = this.draggable.attachListener('changed','boundingBox',this.onDraggableMoved.bind(this));
    }
  };
  Sticky.prototype.onDraggableMoved = function(){
    if(this.isStickyControllable()){
      this.detachMovedListener();
      this.draggable.set('enabled',true);
    }
  };
  Sticky.prototype.displacement = function(){
    var bb = this.draggable.boundingBox.get();
    return [this.initialBB[0]-bb[0],this.initialBB[1]-bb[1]];
  };
  Sticky.prototype.relativeDisplacement = function(){
    var d = this.displacement();
    return [d[0]/this.initialBB[2],d[1]/this.initialBB[3]];
  };
  Sticky.prototype.isStickyControllable = function(){
    var rd = this.relativeDisplacement();
    return this.decisionpercx>=Math.abs(rd[0]) && this.decisionpercy>=Math.abs(rd[1]);
  };
  Sticky.prototype.decide = function(){
    if(this.animator){
      return;
    }
    var bb = this.draggable.get('boundingBox'),
      dx = this.initialBB[0]-bb[0], adx = Math.abs(dx), sdx = dx>0?1:-1,
      dy = this.initialBB[1]-bb[1], ady = Math.abs(dy), sdy = dy>0?1:-1,
      totalpath,trajectory,direction;

    if (adx<0.01 && ady<0.01) {
      return;
    }
    this.draggable.set('enabled',false);
    if(adx>=0.01){
      direction = 'tx';
      totalpath = this.initialBB[0];
      if(adx>bb[2]*this.decisionpercx){
        trajectory = bb[0]+sdx*bb[2];
      }else{
        trajectory = bb[0];
      }
    }else if(ady>=0.01){
      direction = 'ty';
      totalpath = this.initialBB[1];
      if(ady>bb[3]*this.decisionpercy){
        trajectory = bb[1]+sdy*bb[3];
      }else{
        trajectory = bb[1];
      }
    }
    var po = {};
    po[direction] = {amount:totalpath-trajectory};
    var s = this.draggable.moveEvaluator.speed||1;
    var dur = Math.abs(totalpath-trajectory)/s;//200;
    if(dur>300){
      dur=300;
    }
    this.set('animator',new modifierslib.Animator(this.draggable.el,{
      duration:dur,
      props:po
    }));
  };

  function Draggable(controller,path,hotspot){
    mylib.DragAware.call(this, controller, path, hotspot);
    this.sticky = null;
  }
  lib.inherit(Draggable,mylib.DragAware);
  Draggable.prototype.__cleanUp = function(){
    this.sticky = null;
    mylib.DragAware.prototype.__cleanUp.call(this);
  };
  Draggable.prototype.set_sticky = function(val){
    if(this.sticky){
      this.sticky.set('decisionpercx',val.decisionpercx);
      this.sticky.set('decisionpercy',val.decisionpercy);
    }
    this.sticky = val;
  };
  Draggable.prototype.moveBy = function(dx,dy){
    if(this.dragged){return;}
    this.el.moveBy(dx,dy);
  };
  Draggable.prototype.handleDrag = function (dx, dy) {
    this.el.moveBy(dx, dy);
  };
  Draggable.prototype.update_loc = lib.dummyFunc;

  Draggable.prototype.goSticky = function(decisionpercx,decisionpercy,boundingwindow){
    this.set('sticky',new Sticky(this,decisionpercx,decisionpercy,boundingwindow));
  };
  Draggable.prototype.onDragEnd = function () {
    mylib.DragAware.prototype.onDragEnd.apply(this, arguments);
    if(this.sticky){
      this.sticky.decide();
    }
  };
  mylib.Draggable = Draggable;
}

module.exports = createDraggable;

},{}],13:[function(require,module,exports){
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


},{}],14:[function(require,module,exports){
function createEnvironment(lib,hierarchymixinslib,mylib){
  'use strict';
  function Environment(){
    lib.Destroyable.call(this);
    hierarchymixinslib.DestroyableParent.call(this);
    mylib.EventDispatcher.call(this);
  }
  lib.inherit(Environment,hierarchymixinslib.DestroyableParent);
  Environment.prototype.destroy = lib.Destroyable.prototype.destroy;
  Environment.prototype.__cleanUp = function(){
    mylib.EventDispatcher.prototype.__cleanUp.call(this);
    hierarchymixinslib.DestroyableParent.prototype.__cleanUp.call(this);
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  Environment.prototype.dispatchToChild = mylib.EventDispatcher.prototype.dispatchToChild;
  Environment.prototype.dispatchEvent = mylib.EventDispatcher.prototype.dispatchEvent;
  Environment.prototype.checkChildStates = mylib.EventDispatcher.prototype.checkChildStates;
  Environment.prototype.checkChildState = mylib.EventDispatcher.prototype.checkChildState;
  mylib.Environment = Environment;
}

module.exports = createEnvironment;

},{}],15:[function(require,module,exports){
function createEventDispatcher(lib,mylib){
  'use strict';
  function EventDispatcher(){
    this.__childStatesToCheck = {
      active:true
    };
  }
  EventDispatcher.prototype.dispatchToChild = function(affectedchildren,handler,chld){
    //var isactive = (chld.active && chld.active.get) ? chld.active.get() : chld.active;
    var isactive = this.checkChildStates(chld);
    if(!isactive){
      return;
    }
    var aff = handler(chld);
    if(aff){
      affectedchildren.count++;
      return true;
    }
  };
  EventDispatcher.prototype.checkChildStates = function(chld){
    for(var s in this.__childStatesToCheck){
      if(!this.__childStatesToCheck[s]){
        continue;
      }
      if(!this.checkChildState(chld,s)){
        return false;
      }
    }
    return true;
  };
  EventDispatcher.prototype.checkChildState = function(chld,statename){
    var ret = chld.get(statename);
    if(!ret){
      return ret;
    }
    if('function' === typeof ret.get){
      return ret.get();
    }else{
      return ret;
    }
  };
  EventDispatcher.prototype.dispatchEvent = function(handler){
    var affectedchildren = {count:0};
    this.__children.traverse(this.dispatchToChild.bind(this,affectedchildren,handler));
    return affectedchildren.count;
  };
  EventDispatcher.prototype.__cleanUp = function(){
    this.__childStatesToCheck = null;
  };
  mylib.EventDispatcher = EventDispatcher;
}

module.exports = createEventDispatcher;

},{}],16:[function(require,module,exports){
function createHotspotAware(lib,mylib){
  'use strict';
  function HotspotAware(ctrl,path,hotspotctor){
    mylib.Controller.call(this,ctrl,path);
    var ctor = hotspotctor || mylib.AreaAware;
    this.hotspot = new ctor(this,[this.el.hotspotChildId()]);
    this.hotspotDestroyedListener = this.hotspot.destroyed.attach(this.hotspotDestroyed.bind(this));
    this.boundingBox = this.hotspot.boundingBox;
  }
  lib.inherit(HotspotAware,mylib.Controller);
  //debugging purposes only
  HotspotAware.prototype.hotspotDestroyed = function(){
    console.trace();
    console.log('hotspot destroyed on HotspotAware without notice');
    this.hotspotDestroyedListener.destroy();
    this.hotspotDestroyedListener = null;
    this.destroy();
  };
  HotspotAware.prototype.__cleanUp = function(){
    if(this.hotspotDestroyedListener){
      this.hotspotDestroyedListener.destroy();
    }
    this.hotspotDestroyedListener = null;
    this.boundingBox = null;
    this.hotspot.destroy();
    this.hotspot = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  mylib.HotspotAware = HotspotAware;
}

module.exports = createHotspotAware;

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
function createListItem(lib,mathlib,mylib){
  'use strict';
  function ListItem(ctrl,path){
    this.link = null;
    this.container = null;
    mylib.HotspotAware.call(this,ctrl,path);
    this.test_id = null;
  }
  lib.inherit(ListItem,mylib.HotspotAware);
  ListItem.prototype.__cleanUp = function(){
    if (this.container) {
      this.container.removeItem(this);
    }
    this.container = null;
    this.link = null;
    mylib.HotspotAware.prototype.__cleanUp.call(this);
  };

  ListItem.prototype.moveBy = function(dx,dy){
    if (dx instanceof Array) {
      dy = dx[1];
      dx = dx[0];
    }
    this.el.moveBy(dx,dy);
    this.checkVisibility();
  };

  ListItem.prototype.checkVisibility = function () {
    if (!this.container) return;
    if(this.container.boundingBox && 'function' === typeof this.container.boundingBox.get){
      var disp = mathlib.boundingBoxesOverlap(this.boundingBox.get(),this.container.boundingBox.get());
      this.el.set('display',disp);
    }
  };

  ListItem.prototype.containerOnPosition = lib.dummyFunc;
  mylib.ListItem = ListItem;
}

module.exports = createListItem;

},{}],19:[function(require,module,exports){
function createModalStandalone(lib, mylib) {
  'use strict';

  var Standalone = mylib.Standalone;

  //In order to make this thing work, it has to be LAST layer on the screen meaning that it will be the first hit with the mouse click DOM event ... otherwise it simply won't work ...
  function ModalStandalone (controller, path, scene, layerindex) {
    Standalone.call(this, controller, path, scene, layerindex);
    var layer = this.svgEl().__parent;
    layer.preventMousePropagation = true;
    this._ms_layer = layer;
  }
  lib.inherit(ModalStandalone, Standalone);
  ModalStandalone.prototype.__cleanUp = function () {
    this._ms_layer = null;
    Standalone.prototype.__cleanUp.call(this);
  };

  ModalStandalone.prototype.show = function () {
    this._ms_layer.set('user_display', true);
    Standalone.prototype.show.call(this);
  };

  ModalStandalone.prototype.hide = function () {
    this._ms_layer.set('user_display', false);
    Standalone.prototype.hide.call(this);
  };

  mylib.ModalStandalone = ModalStandalone;
}

module.exports = createModalStandalone;

},{}],20:[function(require,module,exports){
function createMouseEnvironment(lib,mylib){
  'use strict';
  var LONGPRESS_INTERVAL = 2000;
  function eventDefaultPreventer(event) {
    event.preventDefault();
  }
  if('ontouchmove' in document.documentElement){
    document.body.addEventListener('touchmove', eventDefaultPreventer, false); 
  }
  function MouseEnvironment(canvas){
    mylib.Environment.call(this);
    this.canvas = null;
    this.lastpos = [69,47];
    this._to = null;
    if(canvas){
      this.canvas = canvas;
      if('ontouchstart' in document.documentElement){
        this.canvas.el.ontouchstart = this.touched.bind(this);
        this.canvas.el.ontouchmove = this.touchmoved.bind(this);
        this.canvas.el.ontouchend = this.untouched.bind(this);
      }else{
        this.canvas.el.onmousemove = this.moved.bind(this);
        this.canvas.el.onmousedown = this.down.bind(this);
        //this.canvas.el.onmouseup = this.up.bind(this);
        document.onmouseup = this.up.bind(this);
        /*
        document.onmousemove = this.moved.bind(this);
        document.onmousedown = this.down.bind(this);
        document.onmouseup = this.up.bind(this);
        */
      }
    }
  }
  lib.inherit(MouseEnvironment,mylib.Environment);
  MouseEnvironment.prototype.__cleanUp = function(){
    this._clearTo();
    if(this.canvas){
      if('ontouchstart' in document.documentElement){
        this.canvas.el.ontouchstart = null;
        this.canvas.el.ontouchmove = null;
        this.canvas.el.ontouchend = null;
      }else{
        this.canvas.el.onmousemove = null;
        this.canvas.el.onmousedown = null;
        //this.canvas.el.onmouseup = null;
        document.onmouseup = null;
      }
    }
    this.canvas = null;
    this.lastpos = null;
    mylib.Environment.prototype.__cleanUp.call(this);
  };
  MouseEnvironment.prototype.mouseMovedToChild = function(evnt,chld){
    return chld.mouseMoved(evnt);
  };
  MouseEnvironment.prototype.mouseDownToChild = function(evnt,chld){
    return chld.mouseDown(evnt);
  };
  MouseEnvironment.prototype.touchToChild = function(evnt,chld){
    return chld.touch(evnt);
  };
  MouseEnvironment.prototype.mouseUpToChild = function(chld){
    return chld.mouseUp();
  };
  MouseEnvironment.prototype.untouchToChild = function(chld){
    return chld.untouch();
  };

  MouseEnvironment.prototype.longpressToChild = function (chld) {
    return chld.onLongpress();
  };

  MouseEnvironment.prototype.moved = function(evnt){
    if(!this.canvas){
      this.lastpos[0] = evnt[0];
      this.lastpos[1] = evnt[1];
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,evnt));
    }else{
      var br = this.canvas.el.getBoundingClientRect();
      this.lastpos[0] = evnt.pageX-br.left;
      this.lastpos[1] = evnt.pageY-br.top;
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,this.lastpos));
    }
  };
  MouseEnvironment.prototype.touchmoved = function(evnt){
    if(!this.canvas){
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,evnt));
    }else{
      var now = (new Date()).getTime();
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      return this.dispatchEvent(this.mouseMovedToChild.bind(this,[evnt.touches[0].pageX-br.left,evnt.touches[0].pageY-br.top]));
    }
  };

  MouseEnvironment.prototype.longpress = function () {
    this.__childStatesToCheck = {active: true};
    return this.dispatchEvent(this.longpressToChild.bind(this));
  };

  MouseEnvironment.prototype._startTo = function () {
    this._clearTo();
    this._to = setTimeout(this.longpress.bind(this), LONGPRESS_INTERVAL);
  };

  MouseEnvironment.prototype._clearTo = function () {
    if (this._to) clearTimeout(this._to);
    this._to = null;
  };

  MouseEnvironment.prototype.down = function(evnt){
    var ret;
    this._startTo();
    if(!this.canvas){
      ret = this.dispatchEvent(this.mouseDownToChild.bind(this,evnt));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.mouseDownToChild.bind(this,[evnt.pageX-br.left,evnt.pageY-br.top]));
    }
    //now that the mouse is pressed, start notifying just the pressed listeners
    this.__childStatesToCheck = {pressed:true};
    return ret;
  };
  MouseEnvironment.prototype.touched = function(evnt){
    var ret=0;
    this._startTo();
    if(!this.canvas){
      ret = this.dispatchEvent(this.touchToChild.bind(this,evnt));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.touchToChild.bind(this,[evnt.touches[0].pageX-br.left,evnt.touches[0].pageY-br.top]));
    }
    this.__childStatesToCheck = {pressed:true};
    return ret;
  };
  MouseEnvironment.prototype.up = function(evnt){
    this._clearTo();
    var ret;
    //now that the mouse is released, start notifying all the active listeners
    this.__childStatesToCheck = {active:true};
    if(!this.canvas){
      ret = this.dispatchEvent(this.mouseUpToChild.bind(this));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      ret = this.dispatchEvent(this.mouseUpToChild.bind(this));
    }
    return ret;
  };
  MouseEnvironment.prototype.untouched = function(evnt){
    this._clearTo();
    var ret;
    this.__childStatesToCheck = {active:true};
    if(!this.canvas){
      ret = this.dispatchEvent(this.untouchToChild.bind(this));
    }else{
      evnt.preventDefault();
      evnt.stopPropagation();
      var br = this.canvas.el.getBoundingClientRect();
      ret = this.dispatchEvent(this.untouchToChild.bind(this));
    }
    return ret;
  };
  mylib.MouseEnvironment = MouseEnvironment;
}

module.exports = createMouseEnvironment;

},{}],21:[function(require,module,exports){
function createMouse(lib,commonlib,mathlib,renderinglib,mylib){
  'use strict';
  function InverseMatrixProperty(neededtargetnames){
    commonlib.LazyListener.call(this,neededtargetnames);
  }
  lib.inherit(InverseMatrixProperty,commonlib.LazyListener);
  InverseMatrixProperty.prototype.calculateValue = function(){
    return mathlib.inverseMatrix(this.targets.transformMatrix.get());
  };

  function Mouse(controller,path){
    this.lastknownpos = [0,0];
    this.hovered = false;
    this.pressed = false;
    mylib.AreaAware.call(this,controller,path);
    this.searchMatrix = new InverseMatrixProperty(['transformMatrix']);
    this.searchMatrix.add('transformMatrix',this.transformMatrix);
    this.mousein = new lib.HookCollection();
    this.mouseout = new lib.HookCollection();
    this.mousepressed = new lib.HookCollection();
    this.mousedragged = new lib.HookCollection();
    this.clicked = new lib.HookCollection();
    this.longpress = new lib.HookCollection();
    this.mouseEnvironment = null;
    this.attachToMouseEnvironment();
    //this.svgEl().mouseEnvironment.addChild(this);
  }
  lib.inherit(Mouse,mylib.AreaAware);
  Mouse.prototype.__cleanUp = function(){
    this.longpress.destruct();
    this.longpress = null;
    this.clicked.destruct();
    this.mouseEnvironment = null;
    this.clicked = null;
    this.mousepressed.destruct();
    this.mousepressed = null;
    this.mouseout.destruct();
    this.mouseout = null;
    this.mousein.destruct();
    this.mousein = null;
    this.mousedragged.destruct();
    this.mousedragged = null;
    this.searchMatrix.destroy();
    this.searchMatrix = null;
    mylib.AreaAware.prototype.__cleanUp.call(this);
    this.pressed = null;
    this.lastknownpos = null;
    this.hovered = null;
  };

  function nextPossibleMouseEnvironmentContainer(e){
    if(e.active && e.active.stack && e.active.stack[0]){
      return e.active.stack[0];
    }
    if(e.__parent instanceof renderinglib.SvgLayer){
      return e.__parent;
    }
  }

  Mouse.prototype.onActiveChanged = function (val) {
    mylib.Controller.prototype.onActiveChanged.apply(this, arguments);
    if (val) {
      if (this.hovered || this.pressed) {
        this.mouseMoved(this.mouseEnvironment.lastpos);
      }
    }
  };
  Mouse.prototype.mouseEnvironmentContainer = function(){
    var e = this.active.stack[0];
    while(e){
      if(e.mouseEnvironment){
        return e;
      }
      e = nextPossibleMouseEnvironmentContainer(e);
    }
  };
  Mouse.prototype.attachToMouseEnvironment = function(){
    var mec = this.mouseEnvironmentContainer();
    if(mec){
      mec.mouseEnvironment.addChild(this);
    }else{
      throw this.id+' did not find a mouseEnvironment in its active stack';
    }
    this.mouseEnvironment = mec.mouseEnvironment;
  };
  Mouse.prototype.doFire = function(evntname){
    var evnt = this[evntname];
    if(!(evnt && evnt.fire)){
      return;
    }
    //lib.runNext(evnt.fire.bind(evnt));
    evnt.fire();
  };
  Mouse.prototype.mouseMoved = function(point){ //synthetic svg mouse environment prepared the point
    if(this.pressed){
      this.lastknownpos = this.capturedPoint(point);
      this.doFire('mousedragged');
      return true;
      //this.mousedragged.fire();
    }else{
      return this.mouseMovedIndifferent(point);
    }
  };
  Mouse.prototype.mouseMovedIndifferent = function(point){
    var contains = this.containsPointFromEvent(point);
    if(contains){
      if(!this.hovered){
        this.hovered = true;
        this.doFire('mousein');
        //this.mousein.fire();
      }
      return true;
    }else{
      if(this.hovered){
        this.hovered = false;
        this.doFire('mouseout');
        //this.mouseout.fire();
        return true;
      }else{
        return false;
      }
    }
  };
  Mouse.prototype.set_pressed = function(val){
    this.pressed = val;
    if(val){
      this.doFire('mousepressed');
      //this.mousepressed.fire();
    }else{
      this.doFire('clicked');
      //this.clicked.fire();
    }
  };
  Mouse.prototype.mouseDown = function(point){
    /*
    if(this.hovered){
      this.set('pressed',true);
      return true;
    }
    */
    if(this.containsPointFromEvent(point)){
      this.set('pressed',true);
      return true;
    }
    return false;
  };
  Mouse.prototype.mouseUp = function(point){
    this.set('pressed',false);
    return true; //?
  };
  Mouse.prototype.touch = function(point){
    if(this.containsPointFromEvent(point)){
      this.hovered = true;
      this.doFire('mousein');
      //this.mousein.fire();
      this.set('pressed',true);
      return true;
    }
    return false;
  };
  Mouse.prototype.untouch = function(){
    var ret = false;
    this.set('pressed',false);
    if(this.hovered){
      ret = true;
      this.hovered = false;
      this.doFire('mouseout');
      //this.mouseout.fire();
    }
    return ret;
  };
  Mouse.prototype.capturedPoint = function(point){
    return mathlib.pointInSpace(point,this.searchMatrix.get());
  };
  Mouse.prototype.containsPointFromEvent = function(point){
    var pos = this.capturedPoint(point);
    var ret = this.el.containsPoint(pos);
    if(ret){
      this.lastknownpos = pos;
    }
    return ret;
  };
  Mouse.prototype.onLongpress = function () {
    this.longpress.fire();
  };
  mylib.Mouse = Mouse;
}

module.exports = createMouse;

},{}],22:[function(require,module,exports){
function createRelativePositionListener(lib,mylib){
  'use strict';
  function checkForBoundingBoxProperty(obj){
    if(!(obj && obj.boundingBox && 'function' === typeof obj.boundingBox.get)){
      throw obj+' has no boundingBox property';
    }
  }
  function RelativePositionListener(areaaware1,areaaware2){
    checkForBoundingBoxProperty(areaaware1);
    checkForBoundingBoxProperty(areaaware2);
    lib.Changeable.call(this);
    this.anchor = areaaware1;
    this.target = areaaware2;
    this.value = [0,0,0,0];
    this._matrixListeners = [];
    var aas1 = areaaware1.boundingBox.targets.transformMatrix.prop.stack,
      aas2 = areaaware2.boundingBox.targets.transformMatrix.prop.stack,
      l = Math.min(aas1.length,aas2.length),
      commonlength = 0,
      i,m;
    for(i = 0; i<l; i++){
      if(aas1[i]===aas2[i]){
        commonlength++;
      }else{
        break;
      }
    }
    this.monitorStack(aas1,commonlength);
    this.monitorStack(aas2,commonlength);
    this.calculateValue();
  }
  lib.inherit(RelativePositionListener,lib.Changeable);
  RelativePositionListener.prototype.destroy = function(){
    lib.Changeable.prototype.__cleanUp.call(this);
    this.anchor = null;
    this.target = null;
    while(this._matrixListeners.length){
      this._matrixListeners.pop().destroy();
    }
  };
  RelativePositionListener.prototype.monitorStack = function(stack,startfrom){
    var se;
    for(var i = startfrom; i<stack.length; i++){
      se = stack[i];
      this._matrixListeners.push(se.attachListener('changed','transformMatrix',this.onMatrixChanged.bind(this,se)));
    }
  };
  RelativePositionListener.prototype.calculateValue = function(){
    var bba = this.anchor.boundingBox.get(), bbt = this.target.boundingBox.get();
    this.value[0] = bbt[0]-bba[0];
    this.value[1] = bbt[1]-bba[1];
    this.value[2] = bba[2]-bbt[2];
    this.value[3] = bba[3]-bbt[3];
  };
  RelativePositionListener.prototype.get = function(){
    if(this.dirty){
      this.calculateValue();
      this.dirty = false;
    }
    return this.value;
  };
  RelativePositionListener.prototype.onMatrixChanged = function(el,matrix){
    this.dirty = true;
    this.changed.fire();
  };

  mylib.RelativePositionListener = RelativePositionListener;
}

module.exports = createRelativePositionListener;

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
function createSlider(lib,mylib){
  'use strict';
  function Slider(controller,groovepath,handlepath,direction,min,max,step){
    mylib.Controller.call(this,controller,[]);
    this.value = null;
    this.values = null;
    this.groove = new mylib.Mouse(this,groovepath);
    this.handle = new mylib.Draggable(this,handlepath);
    this.initHandlePos = this.handle.el.get('transformMatrix').slice(0,2);
    this.setValues(min,max,step);
    this.handle.constrainTo(this.groove,[],direction);
    switch(direction){
      case mylib.DragAware.HORIZONTAL:
      case mylib.DragAware.HORIZONTALINVERSE:
        this.handle.allowDirection(mylib.DragAware.LEFT+mylib.DragAware.RIGHT);
        break;
      case mylib.DragAware.VERTICAL:
      case mylib.DragAware.VERTICALINVERSE:
        this.handle.allowDirection(mylib.DragAware.UP+mylib.DragAware.DOWN);
        break;
    }
    this.handleReleasedListener = this.handle.attachListener('changed','dragged',this.onHandleDraggedChanged.bind(this));
    this.slidingSpace = new mylib.RelativePositionListener(this.groove,this.handle);
    this.slidingSpaceChangedListener = this.slidingSpace.changed.attach(this.onSlidingSpaceChanged.bind(this));
  }
  lib.inherit(Slider,mylib.Controller);
  Slider.prototype.__cleanUp = function(){
    this.slidingSpaceChangedListener.destroy();
    this.slidingSpaceChangedListener = null;
    this.slidingSpace.destroy();
    this.slidingSpace = null;
    this.handleReleasedListener.destroy();
    this.handleReleasedListener = null;
    this.initHandlePos = null;
    this.handle.destroy();
    this.handle = null;
    this.groove.destroy();
    this.groove = null;
    this.values = null;
    this.value = null;
    mylib.Controller.prototype.__cleanUp.call(this);
  };
  Slider.prototype.set = lib.Changeable.prototype.set;

  Slider.prototype.setMax = function () {
    this.set('value',this.values.max);
  };

  Slider.prototype.setMin = function () {
    this.set('value',this.values.min);
  };

  Slider.prototype.stepUp = function () {
    var val = this.get('value')+this.values.step;
    if(val<=this.values.max){
      this.set('value',val);
    }
  };

  Slider.prototype.stepDown = function () {
    var val = this.get('value')-this.values.step;
    if(val>=this.values.min){
      this.set('value',val);
    }
  };

  Slider.prototype.valueToDelta = function(){
    var ss = this.slidingSpace.get(),total = this.values.max-this.values.min, valperc = (this.value-this.values.min)/total, posperc, perccorr;
    switch(this.handle.constrainDirection){
      case mylib.DragAware.HORIZONTAL:
        posperc = ss[0]/ss[2];
        break;
      case mylib.DragAware.VERTICAL:
        posperc = ss[1]/ss[3];
        break;
      case mylib.DragAware.VERTICALINVERSE:
        posperc = (ss[3]-ss[1])/ss[3];
        factor = -1;
        break;
    }
    perccorr = valperc-posperc;
    //console.log('valperc',valperc,'posperc',posperc,'delta',perccorr*ss[2]);
    return [perccorr*ss[2],((this.handle.constrainDirection === mylib.DragAware.VERTICAL)?1:-1)*perccorr*ss[3]];
  };

  Slider.prototype.set_value = function(val){
    //console.log('Slider should move to',val);
    this.value = val;
    this.updateHandlePos();
  };
  function compareHashes(orig,comp){
    if(!(orig&&comp)){
      return false;
    }
    for(var i in orig){
      if(orig[i]!==comp[i]){
        return false;
      }
    }
    return true;
  }
  Slider.prototype.setValues = function(min,max,step){
    var obj = {
      min:min,
      max:max,
      step:step
    };
    if(!compareHashes(this.values,obj)){
      this.handle.el.moveTo.apply(this.handle.el,this.initHandlePos);
      this.values = obj;
      this.value = null;
    }
  };
  Slider.prototype.roundToStep = function(pos,length){
    var stepratio = this.values.step/(this.values.max-this.values.min),
      posratio = pos/length,
      stepcount = Math.round(posratio/stepratio);
    var ret = this.values.min + stepcount*this.values.step;
    if(ret>this.values.max){
      return this.values.max;
    }
    //console.log('roundToStep yields',ret,'on',posratio,'/',stepratio,'=',posratio/stepratio);
    return ret;
  };
  Slider.prototype.onSlidingSpaceChanged = function(){
    if(!(this.values && 'undefined'!== typeof this.values.min)){
      return 0;
    }
    var ss = this.slidingSpace.get();
    switch(this.handle.constrainDirection){
      case Slider.HORIZONTAL:
        this.set('value',this.roundToStep(ss[0],ss[2]));
        break;
      case Slider.VERTICAL:
        this.set('value',this.roundToStep(ss[1],ss[3]));
        break;
      case Slider.VERTICALINVERSE:
        this.set('value',this.roundToStep(ss[3]-ss[1],ss[3]));
        break;
      default:
        this.set('value',[this.roundToStep(ss[0],ss[2]),this.roundToStep(ss[1],ss[3])]);
        break;
    }
  };
  Slider.prototype.onHandleDraggedChanged = function(val){
    if(val===false){
      this.updateHandlePos();
      //lib.runNext(this.onSlidingSpaceChanged.bind(this));
    }
  };
  Slider.prototype.updateHandlePos = function(){
    lib.applyNext(this.handle.moveBy.bind(this.handle),this.valueToDelta());
    //this.handle.moveBy.apply(this.handle,this.valueToDelta());
  };
  Slider.HORIZONTAL = 1;
  Slider.HORIZONTALINVERSE = 2;
  Slider.VERTICAL = 4;
  Slider.VERTICALINVERSE = 8;
  mylib.Slider = Slider;
}

module.exports = createSlider;

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
function createStateButton(lib, renderinglib, mylib) {
  'use strict';
  var Controller = mylib.Controller, 
    Button = mylib.Button, 
    UseButton = mylib.UseButton;

  function StateButton (controller, path, states, default_state) {
    Controller.call(this, controller, path);
    this.state = null;
    this.buttons = {};
    this.disabled_states = [];
    lib.traverse(states, this._createButtons.bind(this));
    if (default_state) {
      this.set('state', default_state);
    }else{
      this.enableAll();
    }
  }
  lib.inherit(StateButton, Controller);
  StateButton.prototype.__cleanUp = function () {
    lib.arryNullAll(this.disabled_states);
    this.disabled_states = null;
    lib.objDestroyAll(this.buttons);
    this.buttons = null;
    this.state = null;
    Controller.prototype.__cleanUp.call(this);
  };

  StateButton.prototype._onButtonsReady = function (results) {
   };

  StateButton.prototype._createButtons = function (path, state) {
    var el = this.get('el').childAtPath(path),
      ctor = (el instanceof renderinglib.Use) ? UseButton : Button;
    this.buttons[state] = new ctor(this, path.split('.'), true, this.set.bind(this, 'state', state));
  };

  StateButton.prototype.set_state = function (state) {
    this.state = state;
    var current = this.buttons[this.state];
    this.enableAll();
    this._do_enable(false, current);
  };

  StateButton.prototype.disableAll = function () {
    lib.traverse(this.buttons, this._do_enable.bind(this, false));
  };

  StateButton.prototype.enableAll = function () {
    lib.traverse(this.buttons, this._do_enable.bind(this, true));
  };

  StateButton.prototype._do_enable = function (enabled, button, state){
    if (!button) return;
    button.set('enabled', this.isStateDisabled(state) ? false : enabled);
    var bckg = button.get('el').childAtPath(button.get('el').get('id')+'_active_bg');
    if (!bckg) return;
    bckg.set('display', !enabled);
  };

  StateButton.prototype.getStateButton = function (state) {
    return this.buttons && state in this.buttons ? this.buttons[state] : null;
  };

  StateButton.prototype.isStateDisabled = function (state) {
    return this.disabled_states.indexOf(state) >= 0;
  };

  StateButton.prototype.enableState = function (state) {
    var index = this.disabled_states.indexOf(state);
    if (index < 0) return;
    this.disabled_states.splice(index, 1);
    this.getStateButton(state).disable();
  };

  StateButton.prototype.disableState = function (state) {
    if (!this.isStateDisabled(state)) {
      this.disabled_states.push(state);
      this.set_state(this.get('state'));
    }
  };

  function UseStateButton (controller, path, states, default_state) {
    Controller.call(this, path);
    this._usb = null;
    this._usb_state = default_state;
    this.get('el').tearOffUse(this._usb_onTearDone.bind(this, states, default_state));
  }
  lib.inherit(UseStateButton, Controller);
  UseStateButton.prototype.__cleanUp = function () {
    this._usb_state = null;
    if (this._usb) this._usb.destroy();
    this._usb = null;
    Controller.prototype.__cleanUp.call(this);
  };

  UseStateButton.prototype._usb_onTearDone = function (states, ds, el) {
    el.show();
    this.set('_usb', new StateButton(this, [el.get('id')], states, ds));
    this._usb.set('state', this._usb_state);
  };

  UseStateButton.prototype.disableAll = function () {
    if(this._usb) this._usb.disableAll();
  };

  UseStateButton.prototype.enableAll = function () {
    if (this._usb) this._usb.enableAll();
  };


  UseStateButton.prototype.getStateButton = function (state) {
    return this._usb ? this._usb.getStateButton(state) : null;
  };
  UseStateButton.prototype.get_state = function () {
    return this._usb_state;
  };

  UseStateButton.prototype.set_state = function (val) {
    this._usb_state = val;
    if (!this._usb) return;
    this._usb.set('state', val);
  };

  mylib.StateButton = StateButton;
  mylib.UseStateButton = UseStateButton;
}

module.exports = createStateButton;

},{}],28:[function(require,module,exports){
function createSvgMouseEnvironment(lib,hierarchymixinslib,mylib){
  'use strict';
  function SvgMouseEnvironment(svg){
    this.svg = svg;
    mylib.ChildMouseEnvironment.call(this);
    hierarchymixinslib.Child.call(this);
    lib.Listenable.call(this);
    this.active = this.svg.get('display');
    this.svgListener = this.svg.attachListener('changed','display',this.setActive.bind(this));
  }
  lib.inherit(SvgMouseEnvironment,mylib.ChildMouseEnvironment);
  SvgMouseEnvironment.prototype.setActive = function(val){
    this.active = val;
  };
  SvgMouseEnvironment.prototype.syntheticEvent = function(evnt){
    var tm = this.svg.transformMatrix, s = this.svg.scale;
    return this.svg.checkIfVisible() && [(evnt[0]-tm[4])/tm[0]/s,(evnt[1]-tm[5])/tm[3]/s];
  };
  SvgMouseEnvironment.prototype.mouseMoved = function(evnt){ //evnt is the point prepared by MouseEnvironment
    return this.svg.checkIfVisible() && this.moved(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.mouseDown = function(evnt){
    return this.svg.checkIfVisible() && this.down(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.touch = function(evnt){
    return this.svg.checkIfVisible() && this.touched(this.syntheticEvent(evnt));
  };
  SvgMouseEnvironment.prototype.untouch = function(evnt){
    return this.svg.checkIfVisible() && this.untouched();
  };
  SvgMouseEnvironment.prototype.mouseUp = function(){
    return this.svg.checkIfVisible() && this.up();
  };
  SvgMouseEnvironment.prototype.onLongpress = function () {
    return this.svg.checkIfVisible() && this.longpress();
  };

  SvgMouseEnvironment.prototype.attachListener = lib.Listenable.prototype.attachListener;
  SvgMouseEnvironment.prototype.__cleanUp = function(){
    if (this.svgListener) {
      this.svgListener.destroy();
    }
    this.svgListener = null;
    this.active = null;
    lib.Listenable.prototype.__cleanUp.call(this);
    hierarchymixinslib.Child.prototype.__cleanUp.call(this);
    mylib.ChildMouseEnvironment.prototype.__cleanUp.call(this);
    this.svg = null;
  };
  mylib.SvgMouseEnvironment = SvgMouseEnvironment;
}

module.exports = createSvgMouseEnvironment;

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
function createToggleButton(lib, mylib) {
  'use strict';
  var Controller = mylib.Controller;

  function setButt (tbinstance, initial_state, path, state) {
    switch (state) {
      case 'on':
        tbinstance.onbutt = new mylib.Button(tbinstance, path, initial_state=='off', tbinstance.onToggle.bind(tbinstance, true));
        break;
      case 'off':
        tbinstance.offbutt = new mylib.Button(tbinstance, path, initial_state=='on', tbinstance.onToggle.bind(tbinstance, false));
        break;
      default:
        throw new lib.Error('INVALID_STATE_IN_PATHS', 'The only valid properties of the "paths" Object are `on` and `off`');
    }
  }

  function ToggleButton (controller, path, enabled, paths, clickcb, state) {
    if (!paths && 'on' in paths && 'off' in paths) {
      throw new lib.Error('INVALID_PATHS_STRUCTURE', "paths must be an Object with a Button path mapped to `on` and a Button path mapped to `off`");
    }
    Controller.call(this,controller,path);
    this.onbutt = null;
    this.offbutt = null;
    this.clickcb = clickcb;
    this.value = (state === 'on' ? true : (state === 'off' ? false : null));
    this.enabled = enabled;
    lib.traverseShallow(paths, setButt.bind(null, this, state));
    this.set('enabled', enabled);
  }
  lib.inherit(ToggleButton, Controller);
  ToggleButton.prototype.set = lib.Changeable.prototype.set;
  ToggleButton.prototype.destroy = function () {
    this.value = null;
    this.clickcb = null;
    if (this.offbutt) {
      this.offbutt.destroy();
    }
    this.offbutt = null;
    if (this.onbutt) {
      this.onbutt.destroy();
    }
    this.onbutt = null;
    Controller.prototype.destroy.call(this);
  };
  ToggleButton.prototype.onToggle = function (ison) {
    if (!(this.onbutt && this.offbutt)) {
      return;
    }
    this.onbutt.set('enabled', !ison);
    this.offbutt.set('enabled', ison);
    this.value = ison;
    if (this.clickcb) {
      this.clickcb(ison);
    }
  };
  ToggleButton.prototype.set_enabled = function (enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.onbutt.set('enabled', false);
      this.onbutt.set('enabled', false);
      return;
    }
    if (this.value === true) {
      this.onbutt.set('enabled', false);
      this.offbutt.set('enabled', true);
      return;
    }
    if (this.value === false) {
      this.onbutt.set('enabled', true);
      this.offbutt.set('enabled', false);
      return;
    }
    this.onbutt.set('enabled', false);
    this.onbutt.set('enabled', false);
  };
  ToggleButton.prototype.onMousePressed = function () {
    var butt = this.actualButton();
    if (butt) {
      butt.onMousePressed.apply(butt, arguments);
    }
  };
  ToggleButton.prototype.onMouseClicked = function () {
    var butt = this.actualButton();
    if (butt) {
      butt.onMouseClicked.apply(butt, arguments);
    }
  };
  ToggleButton.prototype.actualButton = function () {
    if (this.value === true) {
      return this.offbutt;
    }
    if (this.value === false) {
      return this.onbutt;
    }
    return null;
  };

  mylib.ToggleButton = ToggleButton;
}

module.exports = createToggleButton;

},{}],31:[function(require,module,exports){
function createUtil(lib,mylib){
  'use strict';
  function augmentGeometryStack(el){
    if(el.active && el.active.stack){
      el.active.stack.forEach(augmentGeometryStack.bind(this));
    }else{
      this.push(el);
    }
  }

  function transformMatrixStackFromController(controller){
    var ret = [];
    controller.active.stack.forEach(augmentGeometryStack.bind(ret));
    return ret;
  }

  function augmentStack(elid){
    var el = this[this.length-1].childById(elid);
    if(!el){
      throw new Error('Element '+this[this.length-1].id+' has no child with id '+elid);
    }
    this.push(el);
  }

  function stackFromElorControllerAndPath(elorcontroller,path){
    var ret = [elorcontroller];
    //var ret = (elorcontroller.active && elorcontroller.active.stack) ? elorcontroller.active.stack.slice() : [elorcontroller];
    path.forEach(augmentStack.bind(ret));
    return ret;
  }
  mylib.util.transformMatrixStackFromController = transformMatrixStackFromController;
  mylib.util.stackFromElorControllerAndPath = stackFromElorControllerAndPath;
}

module.exports = createUtil;

},{}]},{},[1]);
