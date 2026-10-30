// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  // SDK 56 enables additional React Compiler diagnostics. Keep existing
  // behavior intact during the SDK upgrade while retaining these warnings.
  {
    files: ['src/app/voice.tsx', 'src/app/sensors.tsx'],
    rules: { 'react-hooks/refs': 'warn' },
  },
  {
    files: ['src/app/sensors.tsx'],
    rules: { 'react-hooks/purity': 'warn' },
  },
  {
    ignores: ['dist/*', 'app-example/**', 'components/**', 'constants/**', 'hooks/**'],
  },
]);
