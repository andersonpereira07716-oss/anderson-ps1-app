export const UI = {
  showError(msg) {
    let errBox = document.getElementById('nexa-error-banner');
    if (!errBox) {
      errBox = document.createElement('div');
      errBox.id = 'nexa-error-banner';
      errBox.style.cssText = 'position:fixed;bottom:10px;left:10px;right:10px;background:#ff0055;color:#fff;padding:12px;border-radius:8px;font-family:sans-serif;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;justify-content:space-between;align-items:center;';
      document.body.appendChild(errBox);
    }
    errBox.innerHTML = `<span>⚠️ <b>Erro no Sistema:</b> ${msg}</span><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#fff;font-weight:bold;cursor:pointer;">✕</button>`;
  }
};

window.addEventListener('error', (evt) => UI.showError(evt.message));
window.addEventListener('unhandledrejection', (evt) => UI.showError(evt.reason));
