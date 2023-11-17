/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
    '.eslintrc-auto-import.json'
  ],
  ignorePatterns: ['/node_modules/**/*.*'],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': 'off',
    'prefer-template': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-undef': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    'vue/script-setup-uses-vars': 'error'
  },
  globals: {
    $ref: 'readonly',
    defineProps: 'readonly',
    defineEmits: 'readonly',
    withDefaults: 'readonly',
    defineExpose: 'readonly'
  }
};
