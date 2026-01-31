
class MockBluetooth {
    constructor() {
        this.device = null;
    }

    requestDevice(options) {
        console.log('[MockBLE] requestDevice called with', options);
        this.device = new MockDevice();
        return Promise.resolve(this.device);
    }
}

class MockDevice {
    constructor() {
        this.id = 'mock-device-id-123';
        this.name = 'Boks Mock';
        this.gatt = new MockGattServer(this);
        this.listeners = {};
    }

    addEventListener(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
}

class MockGattServer {
    constructor(device) {
        this.device = device;
        this.connected = false;
        this.services = new Map();
        this._initServices();
    }

    _initServices() {
        // Main Boks Service
        const mainService = new MockService(this, 'a7630001-f491-4f21-95ea-846ba586e361');
        const writeChar = new MockCharacteristic(mainService, 'a7630002-f491-4f21-95ea-846ba586e361', ['write']);
        const notifyChar = new MockCharacteristic(mainService, 'a7630003-f491-4f21-95ea-846ba586e361', ['notify']);
        mainService.addCharacteristic(writeChar);
        mainService.addCharacteristic(notifyChar);
        this.services.set(mainService.uuid, mainService);

        // Battery Service
        const batService = new MockService(this, '0000180f-0000-1000-8000-00805f9b34fb');
        const batChar = new MockCharacteristic(batService, '00000004-0000-1000-8000-00805f9b34fb', ['read']); // Custom UUID used in app
        batService.addCharacteristic(batChar);
        this.services.set(batService.uuid, batService);

        // Device Info Service
        const infoService = new MockService(this, '0000180a-0000-1000-8000-00805f9b34fb');
        const fwChar = new MockCharacteristic(infoService, '00002a26-0000-1000-8000-00805f9b34fb', ['read']);
        infoService.addCharacteristic(fwChar);
        this.services.set(infoService.uuid, infoService);

        // Link logic
        this.writeChar = writeChar;
        this.notifyChar = notifyChar;
        this.batChar = batChar;
        this.fwChar = fwChar;

        // Logic Handler
        writeChar._onWrite = (value) => this._handlePacket(value);

        // Static Data
        batChar._value = new Uint8Array([30, 30, 30, 30, 30, 50]); // Fake battery data
        fwChar._value = new TextEncoder().encode("MockBoks v1.0 (HW 10/125)"); // Vigik compatible
    }

    connect() {
        console.log('[MockBLE] Connecting...');
        this.connected = true;
        return Promise.resolve(this);
    }

    disconnect() {
        console.log('[MockBLE] Disconnecting...');
        this.connected = false;
        if (this.device.listeners['gattserverdisconnected']) {
            this.device.listeners['gattserverdisconnected'].forEach(cb => cb({ target: this.device }));
        }
    }

    getPrimaryService(uuid) {
        if (!this.services.has(uuid)) return Promise.reject(new Error('Service not found'));
        return Promise.resolve(this.services.get(uuid));
    }

    getPrimaryServices() {
        return Promise.resolve(Array.from(this.services.values()));
    }

    // --- Protocol Logic ---

    _handlePacket(data) {
        const opcode = data[0];
        console.log(`[MockFW] RX Opcode: 0x${opcode.toString(16)}`);

        // Helper to send notification
        const notify = (bytes) => {
            setTimeout(() => {
                console.log(`[MockFW] TX: ${Array.from(bytes).map(b=>b.toString(16)).join(' ')}`);
                if (this.notifyChar._onNotify) {
                    this.notifyChar._onNotify({ target: { value: { buffer: bytes.buffer } } });
                }
            }, 100); // Small delay to simulate processing
        };

        const createPacket = (op, payload) => {
            // Protocol: [Opcode, Len, Payload..., Checksum]
            const pkt = new Uint8Array(2 + payload.length + 1);
            pkt[0] = op;

            // Quirk: 0xC3 (NOTIFY_CODES_COUNT) uses Total Length (7) instead of Payload Length (4)
            if (op === 0xC3) {
                pkt[1] = 0x07;
            } else {
                pkt[1] = payload.length;
            }

            pkt.set(payload, 2);

            let cs = 0;
            for(let i=0; i<pkt.length-1; i++) cs = (cs + pkt[i]) % 256;
            pkt[pkt.length-1] = cs;
            return pkt;
        };

        // State
        if (!this.state) {
            this.state = {
                masterCount: 5,
                singleCount: 2,
                logsCount: 15,
                doorOpen: false
            };
        }

        // Quirks: Always send LOGS_COUNT first for most commands
        // Commands that seem to trigger logs count:
        // "la plupart des commandes renvoient d'elle même un log count, avant de répondre"
        if (opcode !== 0x07 && opcode !== 0x03) { // Avoid loop if asking for logs count explicitly
             const logsPayload = new Uint8Array([
                (this.state.logsCount >> 8) & 0xFF,
                this.state.logsCount & 0xFF
             ]);
             notify(createPacket(0x79, logsPayload));
        }

        switch (opcode) {
            case 0x01: // OPEN_DOOR
                // 1. VALID_OPEN_CODE (0x81)
                notify(createPacket(0x81, new Uint8Array([0x00]))); // Payload 0?
                // 2. NOTIFY_DOOR_STATUS (0x84) -> Open
                this.state.doorOpen = true;
                // Packet: [84, 02, 01, 00, CS] (Example from doc: 84 02 01 00 87)
                // App.js: isOpen = value[3] === 1;
                // Wait, example: 84 02 01 00 87.
                // Index 0=84, 1=02 (Len), 2=01 (Status?), 3=00 (??).
                // App.js: const isOpen = value[3] === 1;
                // If value[3] is the boolean, then index 2 is something else?
                // Doc example: 84 02 01 00 87.
                // Let's look at app.js line 454: `const isOpen = value[3] === 1;`
                // So we need value[3] to be 1.
                // Value[2] is likely a reason or source.
                notify(createPacket(0x84, new Uint8Array([0x00, 0x01])));
                break;

            case 0x02: // ASK_DOOR_STATUS
                // ANSWER_DOOR_STATUS (0x85)
                const status = this.state.doorOpen ? 0x01 : 0x00;
                notify(createPacket(0x85, new Uint8Array([0x00, status])));
                break;

            case 0x07: // GET_LOGS_COUNT
                const logsPayload = new Uint8Array([
                    (this.state.logsCount >> 8) & 0xFF,
                    this.state.logsCount & 0xFF
                 ]);
                 notify(createPacket(0x79, logsPayload));
                 break;

            case 0x11: // CREATE_MASTER_CODE
                this.state.masterCount++;
                // Notify Codes Count first
                this._sendCodesCount(notify, createPacket);
                // Success
                notify(createPacket(0x77, new Uint8Array([0x00])));
                break;

            case 0x12: // CREATE_SINGLE_CODE (Quirk: Count++, but Error)
                this.state.singleCount++;
                // Notify Codes Count
                this._sendCodesCount(notify, createPacket);
                // Error (0x78)
                notify(createPacket(0x78, new Uint8Array([0x01]))); // 0x01 = Error code
                break;

            case 0x0C: // DELETE_MASTER_CODE
                if (this.state.masterCount > 0) this.state.masterCount--;
                this._sendCodesCount(notify, createPacket);
                notify(createPacket(0x77, new Uint8Array([0x00])));
                break;

            case 0x14: // COUNT_CODES
                this._sendCodesCount(notify, createPacket);
                break;

            case 0x16: // SET_CONFIGURATION (Vigik)
                notify(createPacket(0xC4, new Uint8Array([0x00])));
                break;

            case 0x03: // REQUEST_LOGS
                // Send a few fake logs
                // CODE_BLE_VALID_HISTORY (0x86)
                // App expects: data.slice(5, 11) for code.
                // Structure: [Op, Len, Age(3), Code(6)...]
                // 0x86, 0x11, 00,00,3C, 31,32,33,34,35,36 ...
                const code = new TextEncoder().encode("123456");
                const logPkt = new Uint8Array(2 + 15 + 1); // Approx
                logPkt[0] = 0x86;
                logPkt[1] = 0x11; // Len
                logPkt[2] = 0; logPkt[3]=0; logPkt[4]=60; // Age
                logPkt.set(code, 5);
                // Padding/Mac
                logPkt[11]=0; logPkt[12]=0;
                logPkt[13]=0xAA; logPkt[14]=0xBB; logPkt[15]=0xCC; logPkt[16]=0xDD;

                // Calc Checksum
                let cs = 0;
                for(let i=0; i<logPkt.length-1; i++) cs = (cs + logPkt[i]) % 256;
                logPkt[logPkt.length-1] = cs;

                setTimeout(() => notify(logPkt), 100);
                setTimeout(() => notify(createPacket(0x92, new Uint8Array([]))), 300); // END_HISTORY
                break;
        }
    }

    _sendCodesCount(notify, createPacket) {
        const payload = new Uint8Array([
            (this.state.masterCount >> 8) & 0xFF,
            this.state.masterCount & 0xFF,
            (this.state.singleCount >> 8) & 0xFF,
            this.state.singleCount & 0xFF
        ]);
        notify(createPacket(0xC3, payload));
    }
}

class MockService {
    constructor(gatt, uuid) {
        this.gatt = gatt;
        this.uuid = uuid;
        this.characteristics = new Map();
    }

    addCharacteristic(char) {
        this.characteristics.set(char.uuid, char);
    }

    getCharacteristic(uuid) {
        if (!this.characteristics.has(uuid)) return Promise.reject(new Error('Char not found'));
        return Promise.resolve(this.characteristics.get(uuid));
    }
}

class MockCharacteristic {
    constructor(service, uuid, properties) {
        this.service = service;
        this.uuid = uuid;
        this.properties = properties; // ['read', 'write', 'notify']
        this._value = new Uint8Array([0]);
        this._onWrite = null;
        this._onNotify = null;
    }

    startNotifications() {
        return Promise.resolve();
    }

    addEventListener(event, callback) {
        if (event === 'characteristicvaluechanged') {
            this._onNotify = callback;
        }
    }

    writeValue(value) {
        if (this._onWrite) {
             const buf = new Uint8Array(value.buffer || value); // handle ArrayBufferView
             this._onWrite(buf);
        }
        return Promise.resolve();
    }

    readValue() {
        return Promise.resolve(new DataView(this._value.buffer));
    }
}

// Global Export
window.MockBluetooth = MockBluetooth;
