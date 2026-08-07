import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

const app = createApp(App);
app.mount('#root');

// Register PWA service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('PWA ServiceWorker registration scope:', reg.scope))
      .catch((err) => console.error('PWA ServiceWorker registration failed:', err));
  });
}
