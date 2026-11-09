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
