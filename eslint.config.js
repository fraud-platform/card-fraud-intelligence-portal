import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "e2e/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "*.config.d.ts",
      ".husky/**",
      "public/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "src/test/**/*", "src/mocks/**/*"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: tsparser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,

      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],

      // React rules
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/jsx-uses-react": "off",
      "react/jsx-no-target-blank": "error",
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "error",
      "react/self-closing-comp": "warn",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh rule
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // General code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "no-nested-ternary": "warn",
      complexity: ["warn", 15],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
  // Disable type-checking rules for JavaScript files
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  // Test files configuration with relaxed rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/test/**/*.ts", "**/test/**/*.tsx", "src/mocks/**/*.ts", "**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        test: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,

      // TypeScript handles globals in tests
      "no-undef": "off",

      // Relaxed TypeScript rules for test files (mocking often requires flexible types)
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // React rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/display-name": "off",

      // General code quality rules (relaxed for tests)
      "no-console": "off",
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },
  // Prettier config (disables conflicting rules)
  prettier,
];
