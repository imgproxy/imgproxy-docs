import * as React from 'react';
import TOCItems from '@theme-original/TOCItems';
import type { Props } from '@theme/TOCItems';

interface TOCTreeNode {
  value: string;
};

function processToc(toc: TOCTreeNode): TOCTreeNode {
  return {
    ...toc,
    value: toc.value.replace(/\(\((\S+)\)\)/, '<i class="badge badge--$1">$1</i>'),
  }
}

export default function TOCItemsWrapper ({
  toc,
  ...props
}: Props) {
  const newToc = toc.flatMap(processToc);
  return <TOCItems toc={newToc} {...props} />;
}
