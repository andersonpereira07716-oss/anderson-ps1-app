import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('NEXA Dashboard inicializado com arquitetura modular ES6.');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => UI.showError('Falha ao registrar Service Worker'));
  }
});
