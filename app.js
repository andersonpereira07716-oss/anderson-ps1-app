import { UI } from './ui.js';
import { StorageDB } from './db.js';

class NexaApp {
    constructor() {
        this.db = new StorageDB();
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.init();
    }

    async init() {
        await this.db.init();
        this.refreshLogCount();
        this.initNetworkListeners();
        this.initBattery();
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

    async initBattery() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                const updateBat = () => UI.updateBattery(battery.level, battery.charging);
                updateBat();
                battery.addEventListener('levelchange', updateBat);
                battery.addEventListener('chargingchange', updateBat);
            } catch (e) {
                UI.logCLI("Telemetria de bateria indisponível.", true);
            }
        }
    }

    initActions() {
        const btnNotify = document.getElementById('btn-notify');
        const btnGPS = document.getElementById('btn-gps');
        const btnExport = document.getElementById('btn-export');
        const btnRec = document.getElementById('btn-rec');

        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        if (btnNotify) btnNotify.addEventListener('click', () => this.sendLocalNotification("NEXA Alerta", "Notificação v4.0 enviada!"));
        if (btnGPS) btnGPS.addEventListener('click', () => this.fetchGPS());
        if (btnExport) btnExport.addEventListener('click', () => this.exportLogsJSON());
        if (btnRec) btnRec.addEventListener('click', () => this.toggleAudioRecording());
    }

    async toggleAudioRecording() {
        const btnRec = document.getElementById('btn-rec');
        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    UI.logCLI(`Áudio gravado (${Math.round(audioBlob.size / 1024)} KB).`);
                    await this.db.addLog(`AUDIO_REC: ${audioBlob.size} bytes`);
                    this.refreshLogCount();
                };

                this.mediaRecorder.start();
                this.isRecording = true;
                if (btnRec) {
                    btnRec.textContent = "PARAR GRAVAÇÃO (GRAVANDO...)";
                    btnRec.style.backgroundColor = "rgba(255, 77, 77, 0.2)";
                }
                UI.logCLI("Gravação de áudio iniciada...");
            } catch (err) {
                UI.logCLI(`Erro ao aceder ao microfone: ${err.message}`, true);
            }
        } else {
            if (this.mediaRecorder) this.mediaRecorder.stop();
            this.isRecording = false;
            if (btnRec) {
                btnRec.textContent = "INICIAR GRAVAÇÃO DE ÁUDIO";
                btnRec.style.backgroundColor = "transparent";
            }
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
                UI.logCLI("Comandos: status, notify, gps, rec, export, db, limpar, reload");
                break;
            case 'status':
                UI.logCLI(`Rede: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'} | PWA v4.0 Active`);
                break;
            case 'rec':
            case 'audio':
                this.toggleAudioRecording();
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
