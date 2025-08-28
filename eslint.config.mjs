import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Apply to JavaScript files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        
        // Node.js globals for scripts
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // For vanilla JS apps with global classes
        WeatherService: 'readonly',
        WeatherUtils: 'readonly',
        
        // Additional Node.js/Browser globals
        URL: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      
      // Basic JavaScript rules - not too strict
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(WeatherService|WeatherUtils)$' // Allow global classes
      }],
      'no-console': 'off', // Allow console.log for debugging
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      
      // Code style - basic formatting
      'indent': ['error', 2, { SwitchCase: 1 }],
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
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      
      // Best practices
      'no-implicit-globals': 'error',
      'no-return-assign': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      
      // Async/await
      'require-await': 'warn',
      'no-async-promise-executor': 'error',
      
      // Error handling
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
    },
  },
  
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Additional globals
        URL: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        
        // DOM types for Angular/TypeScript
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        SubmitEvent: 'readonly',
        Element: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Disable base rule and use TypeScript version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      
      // Basic formatting rules
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
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      
      // TypeScript specific
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
    },
  },
  
  // React-specific rules
  {
    files: ['apps/react/**/*.{js,jsx}', 'apps/preact/**/*.{js,jsx}'],
    rules: {
      // React 17+ doesn't need React import in JSX files
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(React|ErrorBoundary|SearchForm|LoadingState|ErrorState|WeatherContent|CurrentWeather|Forecast|ForecastItem|App)$'
      }],
    },
  },
  
  // Solid-specific rules
  {
    files: ['apps/solid/**/*.{js,jsx}'],
    rules: {
      // Solid JSX components and primitives
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(Show|For|createEffect|createSignal|SearchForm|LoadingState|ErrorState|WeatherContent|CurrentWeather|Forecast|ForecastItem|App)$'
      }],
    },
  },
  
  // jQuery-specific rules
  {
    files: ['apps/jquery/**/*.js'],
    languageOptions: {
      globals: {
        $: 'readonly',
        jQuery: 'readonly',
      },
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      '**/node_modules/',
      'dist/',
      '**/dist/',
      'build/',
      '**/build/',
      '.next/',
      '.nuxt/',
      '.svelte-kit/',
      '**/.svelte-kit/',
      'coverage/',
      '*.min.js',
      '**/*.min.js',
      'apps/*/public/',
      'apps/*/static/',
      'apps/*/node_modules/',
      // Specific build outputs
      'apps/react/dist/',
      'apps/*/dist/',
      'apps/*/build/',
      '.angular/',
      '**/generated/',
      '**/output/',
    ],
  },
];