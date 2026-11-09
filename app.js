import { UI } from './ui.js';

class NexaApp {
    constructor() {
        this.initNetworkListeners();
        this.initNotifications();
        this.initCLI();
    }

    initNetworkListeners() {
        window.addEventListener('online', () => UI.updateNetworkStatus(true));
        window.addEventListener('offline', () => UI.updateNetworkStatus(false));
        UI.updateNetworkStatus(navigator.onLine);
    }

    async initNotifications() {
        const btn = document.getElementById('btn-notify');
        if ('Notification' in window && Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
        
        if (btn) {
            btn.addEventListener('click', () => {
                this.sendLocalNotification("NEXA Alerta", "Teste de notificação local bem-sucedido!");
            });
        }
    }

    sendLocalNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, {
                    body: body,
                    icon: 'IAGenerativa.png',
                    badge: 'IAGenerativa.png'
                });
            });
            UI.logCLI(`Notificação disparada: ${title}`);
        } else {
            UI.logCLI("Permissão de notificação negada.", true);
        }
    }

    initCLI() {
        const input = document.getElementById('cli-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';
                if (!cmd) return;

                UI.logCLI(cmd);
                this.handleCommand(cmd.toLowerCase());
            }
        });
    }

    handleCommand(cmd) {
        switch (cmd) {
            case 'ajuda':
            case 'help':
                UI.logCLI("Comandos: status, notify, limpar, reload");
                break;
            case 'status':
                UI.logCLI(`Rede: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'} | PWA Ativo`);
                break;
            case 'notify':
                this.sendLocalNotification("NEXA CLI", "Comando de notificação executado via terminal!");
                break;
            case 'limpar':
            case 'clear':
                UI.clearCLI();
                break;
            case 'reload':
                UI.logCLI("A recarregar aplicação...");
                setTimeout(() => window.location.reload(), 1000);
                break;
            default:
                UI.logCLI(`Comando desconhecido: '${cmd}'. Digite 'ajuda'.`, true);
                break;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.nexaApp = new NexaApp();
});
