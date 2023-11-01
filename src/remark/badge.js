const visit = require('unist-util-visit');

const plugin = () => {
  const textNode = (value) => ({
    type: 'text',
    value,
  });

  const badgeNode = (label) => {
    let attrs = [];
    let el = 'i';

    switch (label) {
      case 'pro':
        el = 'a';
        attrs.push('href="https://imgproxy.net/#pro"');
        attrs.push('title="This feature is awailable in imgproxy Pro"');
        attrs.push('target="_blank"');
        break;
    }

    return {
      type: 'jsx',
      value: `<${el} className="badge badge--${label}" ${attrs.join(' ')}>${label}</${el}>`,
    };
  };

  const transformer = async (ast) => {
    visit(ast, 'text', (node, index, parent) => {
      if (!node.value) return;

      let rest = node.value;
      let replacement = [];

      const re = /\(\((\S+)\)\)/;
      let match;

      while ((match = re.exec(rest)) !== null) {
        if (match.index > 0)
          replacement.push(textNode(rest.slice(0, match.index)));

        rest = rest.slice(match.index + match[0].length);

        replacement.push(badgeNode(match[1]));
      }

      if (rest)
        replacement.push(textNode(rest));

      if (replacement.length > 1)
        parent.children.splice(index, 1, ...replacement);
    });
  };

  return transformer;
};

module.exports = plugin;
