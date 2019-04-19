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
