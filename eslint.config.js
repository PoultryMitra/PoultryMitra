import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "src/pages/Customers_corrupted.tsx", "test-auto-calculation-system.test.js", "src/pages/FeedPricesOld.tsx"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
  // Disable fast-refresh component-only enforcement to avoid noisy warnings
  "react-refresh/only-export-components": "off",
  "@typescript-eslint/no-unused-vars": "off",
  // Many files use `any` intentionally across the codebase; relax this rule to reduce noise
  "@typescript-eslint/no-explicit-any": "off",
  // Allow empty object types in UI component props used as placeholders
  "@typescript-eslint/no-empty-object-type": "off",
    },
  }
);
