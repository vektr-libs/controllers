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
