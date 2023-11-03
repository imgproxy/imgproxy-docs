import { Grammar } from "prismjs";

const Prism = globalThis.Prism;

Prism.languages.imgproxy_url_option = {
  comment: /\.\.\./,
  keyword: /^[^:]+/m,
  "function-variable": /[^:]+/,
  punctuation: /[:]/,
} as Grammar;

Prism.languages.imgproxy_url = {
  "host-info-sig": {
    pattern: /^[a-z]+:\/\/[^/]+(\/info)?\/[a-zA-Z0-9_-]+/,
    inside: {
      cdata: /^[a-z]+:\/\/[^/]+/,
      attribute: {
        pattern: /\/info\//,
        inside: {
          operator: /\//,
        },
      },
      hexcode: /[a-zA-Z0-9_-]+/,
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
  selector: [
    {
      pattern: /\/plain\/\S+$/,
      inside: {
        attribute: {
          pattern: /^\/plain\//,
          inside: {
            operator: /\//,
          },
        },
        "function-variable": /@[a-z0-9]+$/,
      },
    },
    {
      pattern: /(\/[a-zA-Z0-9_-]+)+(\.[a-z0-9]+)?$/,
      inside: {
        attribute: {
          pattern: /^\/enc\//,
          inside: {
            operator: /\//,
          },
        },
        operator: /^\//,
        "function-variable": /\.[a-z0-9]+$/,
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
      alias: "function-variable",
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
        alias: "selector",
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
  hexcode: /%signature/,
  keyword: /%processing_options|%info_options/,
  selector: /%source_url|%encoded_source_url|%encrypted_source_url/,
  "function-variable": /@%extension|\.%extension/,
  attribute: /info|plain|enc/,
  operator: /\//,
} as Grammar;
