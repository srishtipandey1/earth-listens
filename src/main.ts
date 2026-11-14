import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root element is missing.');
}

app.innerHTML = `
  <main class="shell">
    <p class="eyebrow">NASA EARTH DATA, MADE AUDIBLE</p>
    <h1>Earth Listens</h1>
    <p class="intro">An instrument for the planet.</p>
  </main>
`;
