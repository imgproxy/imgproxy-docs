import * as React from "react";
import Admonition from "@theme-original/Admonition";
import SlowIcon from "@site/static/img/hourglass.svg";

export default function AdmonitionWrapper(props) {
  if (props.type === "slow") {
    return <Admonition {...props} icon={<SlowIcon />} type="note" />;
  }
  return <Admonition {...props} />;
}
