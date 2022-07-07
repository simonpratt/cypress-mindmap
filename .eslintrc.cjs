module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  settings: {
    'import/resolver': { typescript: {} },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
  ignorePatterns: ['node_modules', 'dist', '.prettierrc.js'],
};
