<!-- start_header --> 
<!-- end_header -->

<!-- start_about -->
<!-- end_about -->

<!-- start_status -->
<!-- end_status -->

<!-- start_usage -->
<!-- end_usage -->

<!-- start_framework_specific -->
## Preact Implementation

If you love React but hate the bundle size, Preact is your best friend. It's essentially React, but 3KB instead of 40KB. Same hooks, same JSX, same mental model - just way more efficient. You can literally take a React component, change the import from `react` to `preact`, and it'll work.

For our weather app, switching from React to Preact required basically zero changes. The `useWeatherData` custom hook works identically, functional components behave the same, and `useState` does exactly what you'd expect. But the compiled bundle is drastically smaller and noticeably faster.

Preact's secret sauce is smart optimizations under the hood. It skips unnecessary work that React's virtual DOM usually does, and includes automatic component memoization that you'd have to add manually in React with `memo()`. The reconciliation algorithm is also more direct, making updates snappier.

### Notable files
- `src/App.jsx` - Main component with familiar React-style hooks
- `src/hooks/useWeatherData.js` - Custom hook for weather state and API calls
- `src/components/` - Standard functional components with hooks
- `src/services/WeatherService.js` - API service using native fetch

The developer experience is identical to React. Hot refresh works perfectly, the dev tools are solid, and you can use most React libraries via `preact/compat`. Really, the only difference is your bundle analyzer will make you smile.

I didn't need Preact's router or state management libraries for this simple app, but they follow the same lightweight philosophy. For anything bigger, you'd probably reach for the React ecosystem anyway via the compat layer.
<!-- end_framework_specific -->

<!-- start_real_world_app -->
<!-- end_real_world_app -->

<!-- start_license -->
<!-- end_license -->
