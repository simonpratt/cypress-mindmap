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
  ignorePatterns: ['node_modules', 'dist', '.prettierrc.js'],
};
