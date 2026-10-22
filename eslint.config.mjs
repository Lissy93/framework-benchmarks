import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

// Formatting rules shared by the JavaScript and TypeScript configs
const styleRules = {
  'prefer-const': 'error',
  'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  'semi': ['error', 'always'],
  'comma-dangle': ['error', 'never'],
  'object-curly-spacing': ['error', 'always'],
  'array-bracket-spacing': ['error', 'never'],
  'space-before-function-paren': ['error', 'never'],
  'keyword-spacing': 'error',
  'space-infix-ops': 'error',
  'eol-last': 'error',
  'no-trailing-spaces': 'error',
  'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
};

// Warn on unused variables, except `_args` and the given names (e.g. components only referenced in templates)
const unusedVars = (...names) => ['warn', {
  argsIgnorePattern: '^_',
  ...(names.length && { varsIgnorePattern: `^(${names.join('|')})$` })
}];

const components = ['SearchForm', 'LoadingState', 'ErrorState', 'WeatherContent', 'CurrentWeather', 'Forecast', 'ForecastItem', 'App'];

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Classes the no-build apps attach to window
        WeatherService: 'readonly',
        WeatherUtils: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...styleRules,
      'no-unused-vars': unusedVars('WeatherService', 'WeatherUtils'),
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'no-implicit-globals': 'error',
      'no-return-assign': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'require-await': 'warn',
      'no-async-promise-executor': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: globals.browser
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...js.configs.recommended.rules,
      ...styleRules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': unusedVars(),
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error'
    }
  },
  {
    files: ['apps/react/**/*.{js,jsx}', 'apps/preact/**/*.{js,jsx}'],
    rules: { 'no-unused-vars': unusedVars('React', 'ErrorBoundary', ...components) }
  },
  {
    files: ['apps/solid/**/*.{js,jsx}'],
    rules: { 'no-unused-vars': unusedVars('Show', 'For', 'createEffect', 'createSignal', ...components) }
  },
  {
    files: ['apps/geajs/**/*.{js,jsx}'],
    rules: { 'no-unused-vars': unusedVars('WeatherDisplay', ...components) }
  },
  {
    files: ['apps/jquery/**/*.js'],
    languageOptions: { globals: { $: 'readonly', jQuery: 'readonly' } }
  },
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/.angular/',
      '**/.svelte-kit/',
      '**/*.min.js',
      'apps/*/public/',
      'apps/*/static/',
      'coverage/'
    ]
  }
];
