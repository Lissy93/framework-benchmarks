import { component$ } from '@builder.io/qwik';
import { App } from './App';

export default component$(() => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Weather App - Qwik</title>
        <link rel="stylesheet" href="styles/design-system.css" />
        <link rel="stylesheet" href="styles/variables.css" />
        <link rel="stylesheet" href="styles/base.css" />
        <link rel="stylesheet" href="styles/components.css" />
      </head>
      <body>
        <header class="header">
          <div class="container">
            <h1 class="header__title">Weather Front</h1>
          </div>
        </header>

        <main class="main">
          <div class="container">
            <App />
          </div>
        </main>

        <footer class="footer">
          <div class="container">
            <p class="footer__text">
              Built with Qwik • MIT License •
              <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">Alicia Sykes</a>
            </p>
          </div>
        </footer>
      </body>
    </>
  );
});