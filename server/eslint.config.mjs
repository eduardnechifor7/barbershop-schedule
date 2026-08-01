import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      "no-unused-vars": "warn",

      "no-console": "off"
    }
  }
];