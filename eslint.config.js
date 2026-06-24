import { defineConfig, globalIgnores } from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierConfig from 'eslint-config-prettier/flat'
import vuePlugin from 'eslint-plugin-vue'

const sourceFiles = ['src/**/*.{ts,tsx,vue}', 'vite.config.ts']
const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  File: 'readonly',
  FileReader: 'readonly',
  FormData: 'readonly',
  HTMLElement: 'readonly',
  HTMLImageElement: 'readonly',
  HTMLInputElement: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  window: 'readonly',
}

export default defineConfig([
  globalIgnores(['dist/', 'node_modules/', 'coverage/', 'public/']),

  ...vuePlugin.configs['flat/recommended'],

  {
    name: 'enjoytrip/typescript',
    files: sourceFiles,
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    name: 'enjoytrip/typescript-parser',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  {
    name: 'enjoytrip/vue-typescript-parser',
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: tsParser,
      },
    },
  },

  {
    name: 'enjoytrip/node-config',
    files: ['*.config.{js,mjs,cjs,ts}', 'eslint.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },

  prettierConfig,
])
