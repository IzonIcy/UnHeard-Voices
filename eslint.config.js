import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      ...pluginReactHooks.configs.recommended.rules,
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];
