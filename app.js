import { UI } from './ui.js';
import { StorageDB } from './db.js';

class NexaApp {
    constructor() {
        this.db = new StorageDB();
        this.init();
    }

    async init() {
        await this.db.init();
        this.refreshLogCount();
        this.initNetworkListeners();
        this.initNotifications();
        this.initCLI();
        
        setInterval(() => UI.updateLatency(), 3000);
    }

    async refreshLogCount() {
        const count = await this.db.getLogCount();
        UI.updateLogCount(count);
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

    async sendLocalNotification(title, body) {
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
        await this.db.addLog(`NOTIFY: ${title}`);
        this.refreshLogCount();
    }

    initCLI() {
        const input = document.getElementById('cli-input');
        if (!input) return;

        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';
                if (!cmd) return;

                UI.logCLI(cmd);
                await this.db.addLog(`CMD: ${cmd}`);
                this.refreshLogCount();
                this.handleCommand(cmd.toLowerCase());
            }
        });
    }

    handleCommand(cmd) {
        switch (cmd) {
            case 'ajuda':
            case 'help':
                UI.logCLI("Comandos: status, notify, db, limpar, reload");
                break;
            case 'status':
                UI.logCLI(`Rede: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'} | PWA v2.0`);
                break;
            case 'db':
                this.db.getLogCount().then(c => UI.logCLI(`Total de registos no IndexedDB: ${c}`));
                break;
            case 'notify':
                this.sendLocalNotification("NEXA CLI", "Comando via terminal executado!");
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
