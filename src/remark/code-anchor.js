const visit = require('unist-util-visit');

const plugin = () => {
  const transformer = async (ast) => {
    let knownIds = [];

    visit(ast, 'linkReference', (node, index, parent) => {
      if (!node.children || node.children.length != 1) return;

      let child = node.children[0];

      if (child.type != 'inlineCode') return;

      const idBase = child.value.replaceAll(/[^a-zA-Z0-9_\-]/g, "-");
      let id = idBase;
      let idInd = 0;

      while (knownIds.indexOf(id) >= 0) {
        idInd++;
        id = `${idBase}-${idInd}`;
      }

      knownIds.push(id);

      const replacement = {
        type: 'jsx',
        value: `
          <a id="${id}" href="#${id}" className="code-anchor">
            <code>${child.value}</code>
          </a>
        `,
      };

      parent.children.splice(index, 1, replacement);
    });
  };

  return transformer;
};

module.exports = plugin;
