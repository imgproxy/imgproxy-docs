import { visit } from "unist-util-visit";
import { Transformer } from "unified";
import { Text, Parent } from "mdast";

const plugin = (): Transformer => {
  const textNode = (value) => ({
    type: "text",
    value,
  });

  const badgeNode = (label) => {
    const node = {
      type: "mdxJsxFlowElement",
      name: "i",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "className",
          value: `badge badge--${label}`,
        },
      ],
      children: [textNode(label.charAt(0).toUpperCase() + label.slice(1))],
    };

    switch (label) {
      case "pro":
        node.name = "a";
        node.attributes.push(
          {
            type: "mdxJsxAttribute",
            name: "href",
            value: "https://imgproxy.net/#pro",
          },
          {
            type: "mdxJsxAttribute",
            name: "title",
            value: "This feature is available in imgproxy Pro",
          },
          { type: "mdxJsxAttribute", name: "target", value: "_blank" },
        );
        break;
    }

    return node;
  };

  return (ast) => {
    visit(ast, "text", (node: Text, index: number, parent: Parent) => {
      if (!node.value) return;

      let rest = node.value;
      const replacement = [];

      const re = /\(\((\S+)\)\)/;
      let match;

      while ((match = re.exec(rest)) !== null) {
        if (match.index > 0)
          replacement.push(textNode(rest.slice(0, match.index)));

        rest = rest.slice(match.index + match[0].length);

        replacement.push(badgeNode(match[1]));
      }

      if (rest) replacement.push(textNode(rest));

      if (replacement.length > 1)
        parent.children.splice(index, 1, ...replacement);
    });
  };
};

export default plugin;
