// @ts-check

import globals from "globals";

import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import { configs as tseslint } from "typescript-eslint";
import { flatConfigs as importPlugin } from "eslint-plugin-import-x";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier/recommended";

import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default defineConfig(
  {
    ignores: [
      "**/.idea/",
      "**/.vscode/",
      "**/.docusaurus/",
      "**/node_modules/",
      "build/",
      ".netlify/",
    ],
  },

  eslint.configs.recommended,
  tseslint.recommendedTypeChecked,
  importPlugin.recommended,
  importPlugin.typescript,
  reactPlugin.configs.flat?.recommended,
  reactPlugin.configs.flat?.["jsx-runtime"],
  reactHooksPlugin.configs.flat.recommended,
  jsxA11yPugin.flatConfigs.recommended,
  prettierPlugin,

  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],

    languageOptions: {
      ...reactPlugin.configs.flat?.recommended.languageOptions,

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2024,
        window: true,
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        projectService: true,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: "./tsconfig.json",
          // `@docusaurus/tsconfig` sets `baseUrl` to its own package dir under
          // `node_modules/`, which mis-anchors the `@site/*` -> `./*` mapping
          // there. Re-anchor at the project root.
          alias: {
            "@site": [import.meta.dirname],
          },
        }),
      ],
    },

    rules: {
      "react/jsx-uses-react": "error",
      "@typescript-eslint/no-unused-vars": "error",
      // Docusaurus virtual modules — declared as ambient types in
      // `@docusaurus/module-type-aliases` and resolved by webpack at build
      // time. They have no on-disk path for the resolver to find.
      "import-x/no-unresolved": [
        "error",
        { ignore: ["^@theme-(original|init)/", "^@generated/"] },
      ],
    },
  },
);
