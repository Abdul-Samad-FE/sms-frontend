import path from "path";

import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Global settings
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // Base recommended configs
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettierConfig,
  // Custom rules and settings
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["@", path.resolve("./src")],
            ["@components", path.resolve("./src/components")],
            ["@assets", path.resolve("./src/assets")],
            ["@constants", path.resolve("./src/constants")],
            ["@hooks", path.resolve("./src/hooks")],
            ["@utils", path.resolve("./src/utils")],
            ["@features", path.resolve("./src/features")],
            ["@theme", path.resolve("./src/theme")],
          ],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "import/no-unresolved": "error", // Ensure imports are resolved
      "import/order": [
        "off",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-restricted-paths": "off",
      "react/react-in-jsx-scope": "off", // React 17+ JSX transform
      "react/prop-types": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "no-debugger": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Relax unused vars for enums (globally defined enums)
  {
    files: ["**/constants/enums/**/*.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
