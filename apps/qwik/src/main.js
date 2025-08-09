import { render } from '@builder.io/qwik';

// Simple test to see if Qwik can render at all
const TestComponent = () => {
  return (
    <div>
      <h2>Qwik Test Component</h2>
      <p>If you can see this, Qwik is working!</p>
    </div>
  );
};

console.log('Qwik main.js loaded');

try {
  const appElement = document.getElementById('app');
  console.log('App element found:', appElement);
  
  if (appElement) {
    render(appElement, TestComponent);
    console.log('Render called');
  }
} catch (error) {
  console.error('Error rendering Qwik app:', error);
}