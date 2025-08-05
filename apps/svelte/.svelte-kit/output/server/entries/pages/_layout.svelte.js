import { c as create_ssr_component } from "../../chunks/ssr.js";
import "../../chunks/weather-store.js";
const css = {
  code: "@import '/assets/styles/design-system.css';@import '/assets/styles/variables.css';@import '/assets/styles/base.css';@import '/assets/styles/components.css';",
  map: `{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { weatherStore } from '$lib/stores/weather-store.js';\\n\\n  // Initialize the weather store when the app loads\\n  onMount(async () => {\\n    await weatherStore.initialize();\\n  });\\n<\/script>\\n\\n<main>\\n  <slot />\\n</main>\\n\\n<style>\\n  @import '/assets/styles/design-system.css';\\n  @import '/assets/styles/variables.css';\\n  @import '/assets/styles/base.css';\\n  @import '/assets/styles/components.css';\\n</style>"],"names":[],"mappings":"AAeE,QAAQ,kCAAkC,CAC1C,QAAQ,8BAA8B,CACtC,QAAQ,yBAAyB,CACjC,QAAQ,+BAA+B"}`
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main>${slots.default ? slots.default({}) : ``} </main>`;
});
export {
  Layout as default
};
