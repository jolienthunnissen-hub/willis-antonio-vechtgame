// Lightweight WebRTC data-channel helper for online matches
const NetworkSystem = {
    pc: null,
    dataChannel: null,
    connected: false,
    role: null, // host | client
    onMessage: null,
    onConnected: null,
    onDisconnected: null,

    reset() {
        if (this.dataChannel) {
            try { this.dataChannel.close(); } catch (_) { /* ignore */ }
        }
        if (this.pc) {
            try { this.pc.close(); } catch (_) { /* ignore */ }
        }
        this.pc = null;
        this.dataChannel = null;
        this.connected = false;
        this.role = null;
    },

    async host() {
        this.reset();
        this.role = 'host';
        this.pc = this.createPeer();
        this.dataChannel = this.pc.createDataChannel('game');
        this.setupDataChannel(this.dataChannel);

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        await this.waitForIceGathering();

        const offerCode = btoa(JSON.stringify(this.pc.localDescription));
        window.prompt('Kopieer deze HOST code en stuur naar speler 2:', offerCode);

        const answerCode = window.prompt('Plak hier de ANSWER code van speler 2:');
        if (!answerCode) throw new Error('Geen answer code ingevuld.');

        const answer = JSON.parse(atob(answerCode.trim()));
        await this.pc.setRemoteDescription(answer);
    },

    async join() {
        this.reset();
        this.role = 'client';
        this.pc = this.createPeer();
        this.pc.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel(this.dataChannel);
        };

        const offerCode = window.prompt('Plak hier de HOST code van speler 1:');
        if (!offerCode) throw new Error('Geen host code ingevuld.');

        const offer = JSON.parse(atob(offerCode.trim()));
        await this.pc.setRemoteDescription(offer);

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        await this.waitForIceGathering();

        const answerCode = btoa(JSON.stringify(this.pc.localDescription));
        window.prompt('Kopieer deze ANSWER code en stuur terug naar host:', answerCode);
    },

    createPeer() {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (state === 'connected') {
                this.connected = true;
                if (this.onConnected) this.onConnected();
            } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                this.connected = false;
                if (this.onDisconnected) this.onDisconnected(state);
            }
        };

        return pc;
    },

    setupDataChannel(channel) {
        channel.onopen = () => {
            this.connected = true;
            if (this.onConnected) this.onConnected();
        };
        channel.onclose = () => {
            this.connected = false;
            if (this.onDisconnected) this.onDisconnected('channel-closed');
        };
        channel.onerror = () => {
            this.connected = false;
        };
        channel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (this.onMessage) this.onMessage(message);
            } catch (_) {
                // Ignore malformed messages
            }
        };
    },

    send(type, payload = {}) {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;
        this.dataChannel.send(JSON.stringify({ type, payload }));
    },

    waitForIceGathering() {
        if (this.pc.iceGatheringState === 'complete') return Promise.resolve();

        return new Promise((resolve) => {
            const checkState = () => {
                if (this.pc && this.pc.iceGatheringState === 'complete') {
                    this.pc.removeEventListener('icegatheringstatechange', checkState);
                    resolve();
                }
            };
            this.pc.addEventListener('icegatheringstatechange', checkState);
        });
    }
};
