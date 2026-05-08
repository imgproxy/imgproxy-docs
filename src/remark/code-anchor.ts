import { visit } from "unist-util-visit";
import type { Transformer } from "unified";
import { Text, Link, Parent, RootContent } from "mdast";

const plugin = (): Transformer => {
  return (ast) => {
    const knownIds: string[] = [];

    visit(ast, "text", (node: Text, index: number, parent: Parent) => {
      const code = parent.children[index + 1];
      const nextText = parent.children[index + 2];

      if (!code || !nextText) return;

      if (!node.value.endsWith("[")) return;
      if (code.type !== "inlineCode") return;
      if (nextText.type !== "text" || !nextText.value.startsWith("]")) return;

      const idBase = code.value.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
      let id = idBase;
      let idInd = 0;

      while (knownIds.indexOf(id) >= 0) {
        idInd++;
        id = `${idBase}-${idInd}`;
      }

      knownIds.push(id);

      const replacement: RootContent[] = [
        {
          type: "text",
          value: node.value.slice(0, node.value.length - 1),
        },
        {
          type: "mdxJsxTextElement",
          name: "span",
          attributes: [
            { type: "mdxJsxAttribute", name: "id", value: id },
            {
              type: "mdxJsxAttribute",
              name: "className",
              value: `code-anchor`,
            },
          ],
          children: [
            code,
            {
              type: "link",
              url: `#${id}`,
            } as Link,
          ],
        },
        {
          type: "text",
          value: nextText.value.slice(1),
        },
      ];

      parent.children.splice(index, 3, ...replacement);
    });
  };
};

export default plugin;
