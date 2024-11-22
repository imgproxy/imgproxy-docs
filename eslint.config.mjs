// @ts-check

import * as globals from "globals";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { flatConfigs as importPlugin } from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: [
      "**/.idea/",
      "**/.vscode/",
      "**/.docusaurus/",
      "**/node_modules/",
      "build/",
    ],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      importPlugin.recommended,
      reactPlugin.configs.flat?.recommended,
      reactPlugin.configs.flat?.["jsx-runtime"],
      {
        plugins: { "react-hooks": reactHooksPlugin },
        rules: { ...reactHooksPlugin.configs.recommended.rules },
      },
      jsxA11yPugin.flatConfigs.recommended,
      prettierPlugin,
    ],

    languageOptions: {
      ...reactPlugin.configs.flat?.recommended.languageOptions,

      globals: {
        ...globals.browser,
        ...globals.node,
        window: true,
      },

      ecmaVersion: 5,
      sourceType: "commonjs",

      parserOptions: {
        // projectService: true,
        projectService: {
          // allowDefaultProject: ["eslint.config.mjs"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/extensions": [".ts", ".tsx"],

      "import/resolver": {
        node: {
          paths: ["front"],
        },
      },
    },

    rules: {
      "react/jsx-uses-react": 2,
      "@typescript-eslint/no-unused-vars": 2,

      // TODO Need to fix the errors in project and delete all the rows below
      // basic
      "no-async-promise-executor": 0,
      "import/no-unresolved": 0,

      // react
      "react/prop-types": 0,
      "react/no-find-dom-node": 0,
      "react/no-unescaped-entities": 0,
      "react-hooks/exhaustive-deps": 0,

      // ts
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/no-unsafe-argument": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/restrict-template-expressions": 0,
      "@typescript-eslint/restrict-plus-operands": 0,
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/no-misused-promises": 0,
      "@typescript-eslint/no-empty-interface": 0,

      // a11y
      "jsx-a11y/click-events-have-key-events": 0,
      "jsx-a11y/no-static-element-interactions": 0,
      "jsx-a11y/img-redundant-alt": 0,
      "jsx-a11y/alt-text": 0,
      "jsx-a11y/interactive-supports-focus": 0,
    },
  },
);
