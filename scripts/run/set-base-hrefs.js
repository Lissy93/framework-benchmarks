#!/usr/bin/env node
/**
 * Build script that sets the correct base href for each framework when building for the comparison website
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frameworks = [
  'react', 'vue', 'preact', 'solid', 'qwik', 'jquery', 'lit', 'vanjs',
  'vanilla', 'angular', 'alpine', 'svelte'
];

function buildFrameworkForComparison(framework) {
  const frameworkPath = path.join(__dirname, '..', '..', 'apps', framework);
  const configPath = path.join(frameworkPath, 'vite.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(`⚠️  No vite.config.js found for ${framework}, skipping...`);
    return;
  }
  
  // Read current config
  let config = fs.readFileSync(configPath, 'utf8');
  const originalConfig = config;
  
  // Replace base: './' with base: '/framework/app/'
  config = config.replace(
    /base:\s*['"]\.\/['"],?/g, 
    `base: '/${framework}/app/',`
  );
  
  // For Qwik, also modify CSS imports in root.tsx
  let rootTsxPath, originalRootTsx;
  if (framework === 'qwik') {
    rootTsxPath = path.join(frameworkPath, 'src', 'root.tsx');
    if (fs.existsSync(rootTsxPath)) {
      originalRootTsx = fs.readFileSync(rootTsxPath, 'utf8');
      const modifiedRootTsx = originalRootTsx.replace(
        /href="styles\//g,
        'href="/qwik/app/styles/'
      );
      fs.writeFileSync(rootTsxPath, modifiedRootTsx);
    }
  }
  
  try {
    // Write temporary config
    fs.writeFileSync(configPath, config);
    
    // Build
    console.log(`🔨 Building ${framework} for comparison website...`);
    execSync('npm run build', { 
      cwd: frameworkPath, 
      stdio: 'inherit' 
    });
    
    // Post-build fix for Qwik: update generated HTML and JS files to use correct asset paths
    if (framework === 'qwik') {
      const distHtmlPath = path.join(frameworkPath, 'dist', 'index.html');
      if (fs.existsSync(distHtmlPath)) {
        let html = fs.readFileSync(distHtmlPath, 'utf8');
        // Convert relative paths to absolute paths for the base
        html = html.replace(/src="\.\//g, `src="/${framework}/app/`);
        html = html.replace(/href="\.\//g, `href="/${framework}/app/`);
        fs.writeFileSync(distHtmlPath, html);
        console.log(`🔧 Fixed Qwik asset paths in generated HTML`);
      }
      
      // Also fix CSS paths in the generated JS files
      const buildDir = path.join(frameworkPath, 'dist', 'build');
      if (fs.existsSync(buildDir)) {
        const jsFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.js'));
        jsFiles.forEach(jsFile => {
          const jsPath = path.join(buildDir, jsFile);
          let jsContent = fs.readFileSync(jsPath, 'utf8');
          // Fix CSS paths in the JavaScript bundles
          jsContent = jsContent.replace(/href:"styles\//g, `href:"/${framework}/app/styles/`);
          fs.writeFileSync(jsPath, jsContent);
        });
        console.log(`🔧 Fixed CSS paths in ${jsFiles.length} Qwik JS files`);
      }
    }
    
    console.log(`✅ ${framework} built successfully`);
  } finally {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig);
    
    // Restore original root.tsx for Qwik
    if (framework === 'qwik' && rootTsxPath && originalRootTsx) {
      fs.writeFileSync(rootTsxPath, originalRootTsx);
    }
  }
}

function buildAngularForComparison() {
  const angularPath = path.join(__dirname, '..', '..', 'apps', 'angular');
  
  console.log(`🔨 Building Angular for comparison website...`);
  execSync('npx ng build --configuration=comparison', { 
    cwd: angularPath, 
    stdio: 'inherit' 
  });
  console.log(`✅ Angular built successfully`);
}

function buildSvelteForComparison() {
  const sveltePath = path.join(__dirname, '..', '..', 'apps', 'svelte');
  const configPath = path.join(sveltePath, 'svelte.config.js');
  
  // Read current config
  let config = fs.readFileSync(configPath, 'utf8');
  const originalConfig = config;
  
  // Add paths.base configuration to kit object (correct property for SvelteKit)
  config = config.replace(
    /prerender:\s*{([^}]*)}/,
    `paths: {\n      base: '/svelte/app'\n    },\n    prerender: {$1}`
  );
  
  try {
    // Write temporary config
    fs.writeFileSync(configPath, config);
    
    console.log(`🔨 Building Svelte for comparison website...`);
    execSync('npm run build', { 
      cwd: sveltePath, 
      stdio: 'inherit' 
    });
    console.log(`✅ Svelte built successfully`);
  } finally {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig);
  }
}

function buildVanillaForComparison() {
  const vanillaPath = path.join(__dirname, '..', '..', 'apps', 'vanilla');
  const htmlPath = path.join(vanillaPath, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.log(`⚠️  No index.html found for vanilla, skipping...`);
    return;
  }
  
  // Read current HTML
  let html = fs.readFileSync(htmlPath, 'utf8');
  const originalHtml = html;
  
  // Add base href and convert relative paths to absolute
  html = html.replace(
    /<head>/,
    '<head>\n    <base href="/vanilla/app/">'
  );
  
  // Replace relative asset paths with absolute paths
  html = html.replace(/href="public\//g, 'href="/vanilla/app/public/');
  html = html.replace(/href="styles\.css"/g, 'href="/vanilla/app/styles.css"');
  html = html.replace(/src="js\//g, 'src="/vanilla/app/js/');
  
  try {
    // Write temporary HTML
    fs.writeFileSync(htmlPath, html);
    
    // Create dist directory and copy files
    const distPath = path.join(vanillaPath, 'dist');
    if (fs.existsSync(distPath)) {
      execSync(`rm -rf ${distPath}`, { cwd: vanillaPath });
    }
    fs.mkdirSync(distPath, { recursive: true });
    
    // Copy specific files and directories to dist
    const itemsToCopy = ['index.html', 'js', 'public', 'styles.css', 'favicon.png'];
    itemsToCopy.forEach(item => {
      const itemPath = path.join(vanillaPath, item);
      if (fs.existsSync(itemPath)) {
        execSync(`cp -r ${item} dist/`, { cwd: vanillaPath });
      }
    });
    
    console.log(`✅ vanilla built successfully`);
  } finally {
    // Restore original HTML
    fs.writeFileSync(htmlPath, originalHtml);
  }
}

function buildAlpineForComparison() {
  const alpinePath = path.join(__dirname, '..', '..', 'apps', 'alpine');
  const htmlPath = path.join(alpinePath, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.log(`⚠️  No index.html found for alpine, skipping...`);
    return;
  }
  
  // Read current HTML
  let html = fs.readFileSync(htmlPath, 'utf8');
  const originalHtml = html;
  
  // Add base href and convert relative paths to absolute
  html = html.replace(
    /<head>/,
    '<head>\n    <base href="/alpine/app/">'
  );
  
  // Replace relative asset paths with absolute paths
  html = html.replace(/href="public\//g, 'href="/alpine/app/public/');
  html = html.replace(/href="styles\.css"/g, 'href="/alpine/app/styles.css"');
  html = html.replace(/src="js\//g, 'src="/alpine/app/js/');
  
  try {
    // Write temporary HTML
    fs.writeFileSync(htmlPath, html);
    
    // Create dist directory and copy files
    const distPath = path.join(alpinePath, 'dist');
    if (fs.existsSync(distPath)) {
      execSync(`rm -rf ${distPath}`, { cwd: alpinePath });
    }
    fs.mkdirSync(distPath, { recursive: true });
    
    // Copy specific files and directories to dist
    const itemsToCopy = ['index.html', 'js', 'public', 'styles.css', 'favicon.png'];
    itemsToCopy.forEach(item => {
      const itemPath = path.join(alpinePath, item);
      if (fs.existsSync(itemPath)) {
        execSync(`cp -r ${item} dist/`, { cwd: alpinePath });
      }
    });
    
    console.log(`✅ alpine built successfully`);
  } finally {
    // Restore original HTML
    fs.writeFileSync(htmlPath, originalHtml);
  }
}

// Build all frameworks for comparison
console.log('🚀 Building all frameworks for comparison website...\n');

// Build frameworks with Vite configs (excluding Angular, Svelte, Vanilla, Alpine which need special handling)
const viteFrameworks = frameworks.filter(f => !['angular', 'svelte', 'vanilla', 'alpine'].includes(f));
viteFrameworks.forEach(buildFrameworkForComparison);

// Build frameworks with special configs
buildAngularForComparison();
buildSvelteForComparison();

// Build vanilla and alpine (they don't use build systems, just copy files)
buildVanillaForComparison();
buildAlpineForComparison();

console.log('\n🎉 All frameworks built for comparison website!');
console.log('💡 To build for standalone development, use the regular npm run build commands.');
