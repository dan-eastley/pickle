import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      '.vite/**',
      'node_modules/**',
      'assets/screenshots/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,

  // The react plugin inspects settings on every file it lints (including
  // Node scripts), so the version must be declared globally.
  { settings: { react: { version: 'detect' } } },

  // Application source (browser).
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Not using prop-types — the project relies on the schema/JSDoc instead.
      'react/prop-types': 'off',
      // Quotes/apostrophes in copy are fine and readable.
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      // Surfaced as warnings (tracked tech-debt) rather than blocking — the
      // form-label and autofocus patterns here are deliberate; see
      // BACKLOG.md (Quality, Validation & CI).
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },

  // Build tooling, Vite config, API handlers and scripts (Node).
  {
    files: [
      '*.config.js',
      'scripts/**',
      'tools/**',
      'api/**',
      'vitest.setup.js',
      'playwright.config.js',
    ],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests.
  {
    files: ['**/*.test.{js,jsx}', 'tests/**'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Prettier owns formatting — disable conflicting stylistic rules. Must be last.
  prettier,
]
