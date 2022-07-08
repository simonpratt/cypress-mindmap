module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
    browser: true,
  },
  extends: ['@dtdot/eslint-config/base'],
  ignorePatterns: ['node_modules', 'dist', '.prettierrc.js'],
};
