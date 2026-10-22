import { createVaporApp } from 'vue';
import App from './App.vue';

// Reason: a pure Vapor root avoids pulling the Virtual DOM runtime into the bundle.
createVaporApp(App).mount('#app');
