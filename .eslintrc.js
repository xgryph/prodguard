module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Add any custom rules here
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
  },
  globals: {
    chrome: 'readonly',
  },
};
