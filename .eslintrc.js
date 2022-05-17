module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
  },
  plugins: [
    'react',
  ],
  rules: {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "array-bracket-spacing": 'error',
    "arrow-spacing": 'error',
    complexity: 'error',
    curly: 'off',
    'no-buffer-constructor': 'error',
    'no-var': 'error'
  },
};
