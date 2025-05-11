import { Grammar, TokenObject } from "prismjs";

const Prism = globalThis.Prism;

Prism.languages.imgproxy_url_option = {
  comment: /\.\.\./,
  keyword: /^[^:]+/m,
  selector: /[^:]+/,
  punctuation: /[:]/,
} as Grammar;

Prism.languages.imgproxy_url = {
  "host-info-sig": {
    pattern: /^[a-z]+:\/\/[^/]+(\/info)?\/[a-zA-Z0-9_-]+/,
    inside: {
      cdata: /^[a-z]+:\/\/[^/]+/,
      string: {
        pattern: /\/info\//,
        inside: {
          operator: /\//,
        },
      },
      operator: /\//,
      entity: /[a-zA-Z0-9_-]+/,
    },
  },
  option: {
    pattern: /[^:/]+(:[^:/]+)+/,
    inside: Prism.languages.imgproxy_url_option,
  },
  "pipeline-split": {
    pattern: /\/-\//,
    alias: "tag",
    inside: {
      operator: /\//,
    },
  },
  number: [
    {
      pattern: /\/plain\/\S+$/,
      inside: {
        string: {
          pattern: /^\/plain\//,
          inside: {
            operator: /\//,
          },
        },
        selector: /@[a-z0-9]+$/,
      },
    },
    {
      pattern: /(\/[a-zA-Z0-9_-]+)+(\.[a-z0-9]+)?$/,
      inside: {
        string: {
          pattern: /^\/enc\//,
          inside: {
            operator: /\//,
          },
        },
        operator: /^\//,
        selector: /\.[a-z0-9]+$/,
      },
    },
  ],
  operator: /\//,
  comment: /\.\.\./,
  hint: {
    pattern: /^\s*\^.*$/g,
    alias: "comment",
  },
} as Grammar;

Prism.languages.imgproxy_url_only_presets = Prism.languages.extend(
  "imgproxy_url",
  {
    option: {
      pattern: /[^:/]+(:[^:/]+)+/,
      alias: "selector",
      inside: {
        punctuation: /[:]/,
      },
    },
  },
);

Prism.languages.imgproxy_presets = {
  comment: /^#.*/m,
  preset: {
    pattern: /[^,]+/,
    inside: {
      "preset-name": {
        alias: "number",
        pattern: /^[^=]+/,
      },
      "preset-value": {
        pattern: /[^=]+$/,
        inside: Prism.languages.imgproxy_url,
      },
      punctuation: /=/,
    },
  },
} as Grammar;

Prism.languages.imgproxy_url_template = {
  comment: /^\s*#.*$/gm,
  cdata: /^[a-z]+:\/\/[^/]+/gm,
  entity: /%signature/,
  keyword: /%processing_options|%info_options/,
  number: /%source_url|%encoded_source_url|%encrypted_source_url/,
  selector: /@%extension|\.%extension/,
  string: /info|plain|enc/,
  operator: /\//,
} as Grammar;

// A dirty hack to add more "functions" to bash highlighting
const bash_function = Prism.languages.bash?.function as TokenObject;
if (bash_function?.pattern?.source) {
  bash_function.pattern = new RegExp(
    bash_function.pattern.source.replace(
      "|bash|",
      "|bash|imgproxy|helm|heroku|brew|go|base64|",
    ),
    bash_function.pattern.flags,
  );
}
