export const UI = {
    updateNetworkStatus(isOnline) {
        const badge = document.getElementById('net-badge');
        if (!badge) return;
        if (isOnline) {
            badge.textContent = 'ONLINE';
            badge.className = 'badge online';
        } else {
            badge.textContent = 'OFFLINE (CACHE)';
            badge.className = 'badge offline';
        }
    },

    updateLogCount(count) {
        const el = document.getElementById('val-logs');
        if (el) el.textContent = count;
    },

    updateBattery(level, charging) {
        const el = document.getElementById('val-bat');
        if (el) el.textContent = `${Math.round(level * 100)}%${charging ? ' ⚡' : ''}`;
    },

    updateUptime(seconds) {
        const el = document.getElementById('val-uptime');
        if (el) {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            el.textContent = `${mins}:${secs}`;
        }
    },

    updateGPSStatus(text) {
        const el = document.getElementById('val-gps');
        if (el) el.textContent = text;
    },

    logCLI(text, isError = false) {
        const output = document.getElementById('cli-output');
        if (!output) return;
        const div = document.createElement('div');
        div.style.color = isError ? '#ff4d4d' : 'var(--neon-emerald)';
        div.textContent = `> ${text}`;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    },

    clearCLI() {
        const output = document.getElementById('cli-output');
        if (output) output.innerHTML = '';
    }
};
