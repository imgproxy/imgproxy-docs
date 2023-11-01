module.exports = {
  plain: {
    color: '#eeffff',
    // backgroundColor: '#ffffff0d'
    backgroundColor: '#242529'
  },
  styles: [{
    types: ['comment', 'doctype', 'prolog'],
    style: {
      color: '#808080'
    }
  }, {
    types: ['builtin', 'class-name', 'class', 'selector'],
    style: {
      color: '#ffcb6b'
    }
  }, {
    types: ['atrule', 'attr-name', 'boolean', 'constant', 'id', 'important', 'keyword', 'symbol'],
    style: {
      color: '#c792ea',
    }
  }, {
    types: ['hexcode', 'number', 'unit'],
    style: {
      color: '#f78c6c',
    }
  }, {
    types: ['function', 'function-variable'],
    style: {
      color: '#82aaff',
    }
  }, {
    types: ['deleted', 'entity', 'url'],
    style: {
      color: '#f44747',
    }
  }, {
    types: ['attr-value', 'attribute', 'pseudo-class', 'pseudo-element', 'regex', 'string', 'template-punctuation'],
    style: {
      color: '#c3e88d',
    }
  }, {
    types: ['tag'],
    style: {
      color: '#f07178'
    }
  }, {
    types: ['operator', 'punctuation', 'quantifier'],
    style: {
      color: '#89ddff'
    }
  }, {
    types: ['cdata', 'char', 'inserted', 'property'],
    style: {
      color: '#b2ccd6'
    }
  }, {
    types: ['script'],
    style: {
      color: '#eeffff'
    }
  }]
};
