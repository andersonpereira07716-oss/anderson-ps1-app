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
        this.initActions();
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

    initActions() {
        const btnNotify = document.getElementById('btn-notify');
        const btnGPS = document.getElementById('btn-gps');
        const btnExport = document.getElementById('btn-export');

        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        if (btnNotify) {
            btnNotify.addEventListener('click', () => this.sendLocalNotification("NEXA Alerta", "Teste de notificação local v3.0!"));
        }

        if (btnGPS) {
            btnGPS.addEventListener('click', () => this.fetchGPS());
        }

        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportLogsJSON());
        }
    }

    fetchGPS() {
        if ('geolocation' in navigator) {
            UI.updateGPSStatus('A LER...');
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    UI.updateGPSStatus(coords);
                    UI.logCLI(`GPS Localizado: ${coords}`);
                    await this.db.addLog(`GPS: ${coords}`);
                    this.refreshLogCount();
                },
                async (err) => {
                    UI.updateGPSStatus('ERRO / NEGADO');
                    UI.logCLI(`Erro GPS: ${err.message}`, true);
                },
                { timeout: 10000 }
            );
        } else {
            UI.updateGPSStatus('INDISPONÍVEL');
            UI.logCLI("Geolocalização não suportada.", true);
        }
    }

    async exportLogsJSON() {
        const logs = await this.db.getAllLogs();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `nexa_logs_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        UI.logCLI(`Exportados ${logs.length} registos em JSON.`);
        await this.db.addLog(`EXPORT: ${logs.length} logs`);
        this.refreshLogCount();
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

    async handleCommand(cmd) {
        switch (cmd) {
            case 'ajuda':
            case 'help':
                UI.logCLI("Comandos: status, notify, gps, export, db, limpar, reload");
                break;
            case 'status':
                UI.logCLI(`Rede: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'} | PWA v3.0 Active`);
                break;
            case 'gps':
                this.fetchGPS();
                break;
            case 'export':
                this.exportLogsJSON();
                break;
            case 'db':
                const c = await this.db.getLogCount();
                UI.logCLI(`Total de registos no IndexedDB: ${c}`);
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
