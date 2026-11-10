// Gestão de Base de Dados Local Segura (IndexedDB) com Sanitização
export class StorageDB {
    constructor() {
        this.dbName = 'NEXA_SECURE_DB';
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    sanitize(text) {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    }

    async addLog(message) {
        if (!this.db) await this.init();
        const cleanMessage = this.sanitize(message);
        return new Promise((resolve) => {
            const tx = this.db.transaction('logs', 'readwrite');
            const store = tx.objectStore('logs');
            store.add({ message: cleanMessage, timestamp: new Date().toISOString() });
            tx.oncomplete = () => resolve(true);
        });
    }

    async getLogCount() {
        if (!this.db) await this.init();
        return new Promise((resolve) => {
            const tx = this.db.transaction('logs', 'readonly');
            const store = tx.objectStore('logs');
            const req = store.count();
            req.onsuccess = () => resolve(req.result);
        });
    }

    async getAllLogs() {
        if (!this.db) await this.init();
        return new Promise((resolve) => {
            const tx = this.db.transaction('logs', 'readonly');
            const store = tx.objectStore('logs');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
        });
    }
}
