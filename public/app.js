// BLE Constants
const SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
const WRITE_CHAR_UUID = 'a7630002-f491-4f21-95ea-846ba586e361';
const NOTIFY_CHAR_UUID = 'a7630003-f491-4f21-95ea-846ba586e361';

// Opcodes
const OP_OPEN_DOOR = 0x01;
const OP_GET_LOGS_COUNT = 0x07;
const OP_REQUEST_LOGS = 0x03;
const OP_CREATE_MASTER = 0x11;
const OP_CREATE_SINGLE = 0x12;
const OP_CREATE_MULTI = 0x13;
const OP_NOTIFY_LOGS_COUNT = 0x79;
const OP_END_HISTORY = 0x92;

// State
let device = null;
let server = null;
let service = null;
let writeChar = null;
let notifyChar = null;

// UI Elements
const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const controlsDiv = document.getElementById('controls');
const consoleLog = document.getElementById('consoleLog');
const clearLogBtn = document.getElementById('clearLogBtn');

// Event Listeners
connectBtn.addEventListener('click', connect);
clearLogBtn.addEventListener('click', () => consoleLog.innerHTML = '');

document.getElementById('openDoorBtn').addEventListener('click', openDoor);
document.getElementById('createCodeBtn').addEventListener('click', createCode);
document.getElementById('getLogsBtn').addEventListener('click', getLogs);

document.getElementById('codeType').addEventListener('change', (e) => {
    const indexGroup = document.getElementById('indexGroup');
    indexGroup.style.display = e.target.value === 'master' ? 'flex' : 'none';
});

// Logging
function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-entry log-${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleLog.appendChild(div);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function logPacket(label, data) {
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ');
    log(`${label}: ${hex}`, label === 'TX' ? 'tx' : 'rx');
}

// BLE Functions
async function connect() {
    try {
        log('Requesting Bluetooth Device...');
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE_UUID] }]
        });

        device.addEventListener('gattserverdisconnected', onDisconnected);

        log('Connecting to GATT Server...');
        server = await device.gatt.connect();

        log('Getting Service...');
        service = await server.getPrimaryService(SERVICE_UUID);

        log('Getting Characteristics...');
        writeChar = await service.getCharacteristic(WRITE_CHAR_UUID);
        notifyChar = await service.getCharacteristic(NOTIFY_CHAR_UUID);

        log('Starting Notifications...');
        await notifyChar.startNotifications();
        notifyChar.addEventListener('characteristicvaluechanged', handleNotifications);

        statusDiv.textContent = 'Connected';
        statusDiv.className = 'status connected';
        connectBtn.disabled = true;
        controlsDiv.classList.remove('disabled');
        log('Connected successfully!');

    } catch (error) {
        log('Connection failed: ' + error, 'error');
    }
}

function onDisconnected() {
    statusDiv.textContent = 'Disconnected';
    statusDiv.className = 'status disconnected';
    connectBtn.disabled = false;
    controlsDiv.classList.add('disabled');
    log('Device disconnected', 'error');
}

function handleNotifications(event) {
    const value = new Uint8Array(event.target.value.buffer);
    logPacket('RX', value);

    const opcode = value[0];
    
    if (opcode === OP_NOTIFY_LOGS_COUNT) {
        const logCount = value[2];
        log(`Logs count: ${logCount}`, 'info');
        if (logCount > 0) {
            requestLogs();
        } else {
            log('No logs to retrieve', 'info');
        }
    } else if (opcode === OP_END_HISTORY) {
        log('End of history received', 'info');
    } else if (opcode >= 0x86 && opcode <= 0xA2) {
        parseLogEvent(value);
    }
}

async function sendPacket(packet) {
    try {
        logPacket('TX', packet);
        await writeChar.writeValue(packet);
    } catch (error) {
        log('Send failed: ' + error, 'error');
    }
}

// Command Functions
async function openDoor() {
    const code = document.getElementById('openCode').value;
    if (!/^[0-9AB]{6}$/.test(code)) {
        log('Invalid code format. Must be 6 chars (0-9, A, B)', 'error');
        return;
    }

    // Packet: [0x01, Length, Code...]
    // Length = 6 (code)
    const packet = new Uint8Array(8);
    packet[0] = OP_OPEN_DOOR;
    packet[1] = 0x06;
    for (let i = 0; i < 6; i++) {
        packet[2 + i] = code.charCodeAt(i);
    }

    await sendPacket(packet);
}

async function createCode() {
    const configKey = document.getElementById('configKey').value;
    const newCode = document.getElementById('newCode').value;
    const type = document.getElementById('codeType').value;
    const index = parseInt(document.getElementById('codeIndex').value);

    if (configKey.length !== 8) {
        log('Config Key must be 8 chars', 'error');
        return;
    }
    if (!/^[0-9AB]{6}$/.test(newCode)) {
        log('Invalid code format', 'error');
        return;
    }

    let opcode;
    if (type === 'master') opcode = OP_CREATE_MASTER;
    else if (type === 'single') opcode = OP_CREATE_SINGLE;
    else if (type === 'multi') opcode = OP_CREATE_MULTI;

    // Calculate length
    // Base: Opcode(1) + Length(1) + Key(8) + Code(6) + Checksum(1) = 17
    // Master adds Index(1) = 18
    const length = type === 'master' ? 18 : 17;
    const payloadLength = type === 'master' ? 16 : 15; // Key(8) + Code(6) + [Index(1)] + Checksum(1) ?? No, Length usually excludes Opcode/Length/Checksum bytes in some protocols, but here doc says "Length" field.
    // Doc says: [Opcode][Length][ConfigKey][Code][Index?][Checksum]
    // Let's assume Length is the number of bytes following the Length byte, excluding Checksum? Or including?
    // Re-reading doc:
    // 0x11: [0x11][LENGTH][CONFIG_KEY(8)][CODE(6)][INDEX(1)][CHECKSUM] -> Total 18.
    // So Length byte value?
    // 0x12: [0x12][LENGTH][CONFIG_KEY(8)][CODE(6)][CHECKSUM] -> Total 17.
    
    // Let's look at examples in doc.
    // 0x16 example: 16 0a ... (10 bytes payload) -> 8 key + 1 type + 1 enabled.
    // So Length seems to be payload length (excluding checksum).
    
    // For 0x11: Key(8) + Code(6) + Index(1) = 15 bytes.
    // For 0x12/0x13: Key(8) + Code(6) = 14 bytes.

    const packetLength = type === 'master' ? 18 : 17;
    const packet = new Uint8Array(packetLength);
    
    let p = 0;
    packet[p++] = opcode;
    packet[p++] = type === 'master' ? 15 : 14; // Length of payload

    // Config Key (ASCII)
    for (let i = 0; i < 8; i++) {
        packet[p++] = configKey.charCodeAt(i);
    }

    // Code (ASCII)
    for (let i = 0; i < 6; i++) {
        packet[p++] = newCode.charCodeAt(i);
    }

    // Index (Master only)
    if (type === 'master') {
        packet[p++] = index;
    }

    // Checksum
    let checksum = 0;
    for (let i = 0; i < p; i++) {
        checksum = (checksum + packet[i]) % 256;
    }
    packet[p++] = checksum;

    await sendPacket(packet);
}

async function getLogs() {
    // 1. Get Logs Count
    // Packet: [0x07, 0x00, 0x07]
    const packet = new Uint8Array([OP_GET_LOGS_COUNT, 0x00, OP_GET_LOGS_COUNT]);
    await sendPacket(packet);
}

async function requestLogs() {
    // 2. Request Logs
    // Packet: [0x03, 0x00, 0x03]
    const packet = new Uint8Array([OP_REQUEST_LOGS, 0x00, OP_REQUEST_LOGS]);
    await sendPacket(packet);
}

function parseLogEvent(data) {
    const opcode = data[0];
    const length = data[1];
    const payload = data.slice(2, 2 + length);
    
    const container = document.getElementById('logsContainer');
    const div = document.createElement('div');
    div.style.borderBottom = '1px solid #eee';
    div.style.padding = '5px';

    let text = `Op: 0x${opcode.toString(16).toUpperCase()} `;

    if (opcode === 0x86) { // CODE_BLE_VALID
        // Payload: ... Code(6) Timestamp(8) ...
        // Based on doc: [Flags?][Code 6][Timestamp 8]
        // Example: 0004b2 383632303036 0000dc3b76ad6c
        // Offset 3 is code start?
        // Let's try to extract ASCII code if possible
        // It's hard to parse exactly without full spec of payload offsets, but we can try to find the code.
        text += "(BLE Valid)";
    } else if (opcode === 0x91) {
        text += "(Door Open)";
    } else if (opcode === 0x90) {
        text += "(Door Close)";
    }

    div.textContent = text + " " + Array.from(data).map(b => b.toString(16).padStart(2,'0')).join('');
    container.appendChild(div);
}