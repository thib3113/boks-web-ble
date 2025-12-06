// BLE Constants
const SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
const WRITE_CHAR_UUID = 'a7630002-f491-4f21-95ea-846ba586e361';
const NOTIFY_CHAR_UUID = 'a7630003-f491-4f21-95ea-846ba586e361';

const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_LEVEL_CHAR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';

const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
const SOFTWARE_REV_CHAR_UUID = '00002a28-0000-1000-8000-00805f9b34fb';

// Opcodes
const OP_OPEN_DOOR = 0x01;
const OP_ASK_DOOR_STATUS = 0x02;
const OP_GET_LOGS_COUNT = 0x07;
const OP_REQUEST_LOGS = 0x03;
const OP_CREATE_MASTER = 0x11;
const OP_CREATE_SINGLE = 0x12;
const OP_CREATE_MULTI = 0x13;
const OP_NOTIFY_LOGS_COUNT = 0x79;
const OP_NOTIFY_DOOR_STATUS = 0x84;
const OP_ANSWER_DOOR_STATUS = 0x85;
const OP_END_HISTORY = 0x92;
const OP_NOTIFY_CODES_COUNT = 0xC3;

const OPCODE_NAMES = {
    0x01: 'OPEN_DOOR',
    0x02: 'ASK_DOOR_STATUS',
    0x03: 'REQUEST_LOGS',
    0x06: 'REBOOT',
    0x07: 'GET_LOGS_COUNT',
    0x08: 'TEST_BATTERY',
    0x09: 'MASTER_CODE_EDIT',
    0x0A: 'SINGLE_USE_CODE_TO_MULTI',
    0x0B: 'MULTI_CODE_TO_SINGLE_USE',
    0x0C: 'DELETE_MASTER_CODE',
    0x0D: 'DELETE_SINGLE_USE_CODE',
    0x0E: 'DELETE_MULTI_USE_CODE',
    0x0F: 'REACTIVATE_CODE',
    0x10: 'GENERATE_CODES',
    0x11: 'CREATE_MASTER_CODE',
    0x12: 'CREATE_SINGLE_USE_CODE',
    0x13: 'CREATE_MULTI_USE_CODE',
    0x14: 'COUNT_CODES',
    0x15: 'GENERATE_CODES_SUPPORT',
    0x16: 'SET_CONFIGURATION',
    0x17: 'REGISTER_NFC_TAG_SCAN_START',
    0x18: 'REGISTER_NFC_TAG',
    0x19: 'UNREGISTER_NFC_TAG',
    0x20: 'RE_GENERATE_CODES_PART1',
    0x21: 'RE_GENERATE_CODES_PART2',
    0x50: 'SCALE_BOND',
    0x52: 'SCALE_GET_MAC_ADDRESS_BOKS',
    0x53: 'SCALE_FORGET_BONDING',
    0x55: 'SCALE_TARE_EMPTY',
    0x56: 'SCALE_TARE_LOADED',
    0x57: 'SCALE_MEASURE_WEIGHT',
    0x60: 'SCALE_PREPARE_DFU',
    0x61: 'SCALE_GET_RAW_SENSORS',
    0x62: 'SCALE_RECONNECT',
    0x77: 'CODE_OPERATION_SUCCESS',
    0x78: 'CODE_OPERATION_ERROR',
    0x79: 'NOTIFY_LOGS_COUNT',
    0x80: 'ERROR_COMMAND_NOT_SUPPORTED',
    0x81: 'VALID_OPEN_CODE',
    0x82: 'INVALID_OPEN_CODE',
    0x84: 'NOTIFY_DOOR_STATUS',
    0x85: 'ANSWER_DOOR_STATUS',
    0x86: 'CODE_BLE_VALID_HISTORY',
    0x87: 'CODE_KEY_VALID_HISTORY',
    0x88: 'CODE_BLE_INVALID_HISTORY',
    0x89: 'CODE_KEY_INVALID_HISTORY',
    0x90: 'DOOR_CLOSE_HISTORY',
    0x91: 'DOOR_OPEN_HISTORY',
    0x92: 'END_HISTORY',
    0x93: 'HISTORY_ERASE',
    0x94: 'POWER_OFF',
    0x95: 'BLOCK_RESET',
    0x96: 'POWER_ON',
    0x97: 'BLE_REBOOT',
    0x98: 'SCALE_CONTINUOUS_MEASURE',
    0x99: 'KEY_OPENING',
    0xA0: 'ERROR',
    0xA1: 'NFC_OPENING',
    0xA2: 'NFC_TAG_REGISTERING_SCAN',
    0xB0: 'NOTIFY_SCALE_BONDING_SUCCESS',
    0xB1: 'NOTIFY_SCALE_BONDING_ERROR',
    0xB2: 'NOTIFY_MAC_ADDRESS_BOKS_SCALE',
    0xB3: 'NOTIFY_SCALE_BONDING_FORGET_SUCCESS',
    0xB4: 'NOTIFY_SCALE_BONDING_PROGRESS',
    0xB5: 'NOTIFY_SCALE_TARE_EMPTY_OK',
    0xB6: 'NOTIFY_SCALE_TARE_LOADED_OK',
    0xB7: 'NOTIFY_SCALE_MEASURE_WEIGHT',
    0xB8: 'NOTIFY_SCALE_DISCONNECTED',
    0xB9: 'NOTIFY_SCALE_RAW_SENSORS',
    0xBA: 'NOTIFY_SCALE_FAULTY',
    0xC0: 'NOTIFY_CODE_GENERATION_SUCCESS',
    0xC1: 'NOTIFY_CODE_GENERATION_ERROR',
    0xC2: 'NOTIFY_CODE_GENERATION_PROGRESS',
    0xC3: 'NOTIFY_CODES_COUNT',
    0xC4: 'NOTIFY_SET_CONFIGURATION_SUCCESS',
    0xC5: 'NOTIFY_NFC_TAG_REGISTER_SCAN_RESULT',
    0xC6: 'NOTIFY_NFC_TAG_REGISTER_SCAN_ERROR_ALREADY_EXISTS',
    0xC7: 'NOTIFY_NFC_TAG_REGISTER_SCAN_TIMEOUT',
    0xC8: 'NOTIFY_NFC_TAG_REGISTERED_SUCCESS',
    0xC9: 'NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS',
    0xCA: 'NOTIFY_NFC_TAG_UNREGISTERED_SUCCESS',
    0xE0: 'ERROR_CRC',
    0xE1: 'ERROR_UNAUTHORIZED',
    0xE2: 'ERROR_BAD_REQUEST'
};

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
const deviceInfoDiv = document.getElementById('deviceInfo');
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

function parsePacketDetails(opcode, data) {
    // Helper to format hex string
    const toHex = (arr) => Array.from(arr).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    try {
        if (opcode === OP_NOTIFY_LOGS_COUNT && data.length >= 4) {
            const count = (data[2] << 8) | data[3];
            return `Count=${count}`;
        }

        if ((opcode === OP_ANSWER_DOOR_STATUS || opcode === OP_NOTIFY_DOOR_STATUS) && data.length >= 4) {
            const isClosed = data[3] === 0;
            const isOpen = data[3] === 1;
            const state = isOpen ? 'OPEN' : (isClosed ? 'CLOSED' : `UNKNOWN(${data[3]})`);
            return `Status=${state}`;
        }

        if (opcode === OP_NOTIFY_CODES_COUNT && data.length >= 6) {
             const masterCount = (data[2] << 8) | data[3];
             const singleCount = (data[4] << 8) | data[5];
             return `Master=${masterCount}, Single=${singleCount}`;
        }

        // History Events (Opcode 0x86 - 0xA2, generally)
        // General structure: [Opcode][Len][Age 3 bytes]...
        // We can at least parse the Age for all history events if len >= 5
        if ((opcode >= 0x86 && opcode <= 0xA2) && data.length >= 5) {
             const age = (data[2] << 16) | (data[3] << 8) | data[4];
             let extra = '';

             // Specific Parsers based on Opcode
             if (opcode === 0x86 || opcode === 0x88) { // CODE_BLE_VALID / INVALID
                 // [Op][Len][Age 3][Code 6][Pad 2][Mac 6] ?
                 // Based on examples: 86 11 0004b2 313233344142 0000 dc3b76ad6c4a
                 if (data.length >= 11) {
                     const codeBytes = data.slice(5, 11);
                     const codeStr = new TextDecoder().decode(codeBytes);
                     extra = `, Code="${codeStr}"`;
                 }
             } else if (opcode === 0x87 || opcode === 0x89) { // CODE_KEY_VALID / INVALID
                 // [Op][Len][Age 3][Code 6]
                 if (data.length >= 11) {
                     const codeBytes = data.slice(5, 11);
                     const codeStr = new TextDecoder().decode(codeBytes);
                     extra = `, Code="${codeStr}"`;
                 }
             } else if (opcode === 0x94) { // POWER_OFF
                 // [Op][Len][Age 3][Reason 1]
                 if (data.length >= 6) {
                     const reasonMap = {1:'PIN_RESET', 2:'WATCHDOG', 3:'SOFT_RESET', 4:'LOCKUP', 5:'GPIO', 6:'LPCOMP', 7:'DEBUG', 8:'NFC'};
                     extra = `, Reason=${reasonMap[data[5]] || data[5]}`;
                 }
             } else if (opcode === 0xA0) { // ERROR
                 // [Op][Len][Age 3][ErrorCode 1]
                 if (data.length >= 6) {
                     extra = `, ErrorCode=${data[5]}`;
                 }
             }

             return `Age=${age}s${extra}`;
        }

        return '';
    } catch (e) {
        return `ParseError: ${e.message}`;
    }
}

function logPacket(label, data) {
    const opcode = data[0];
    const opName = OPCODE_NAMES[opcode] || `UNKNOWN_OP(0x${opcode.toString(16).toUpperCase()})`;
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    let details = parsePacketDetails(opcode, data);
    if (details) {
        details = ` | ${details}`;
    }

    log(`${label}: [${opName}] ${hex}${details}`, label === 'TX' ? 'tx' : 'rx');
}

// BLE Functions
async function connect() {
    try {
        log('Requesting Bluetooth Device...');
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE_UUID] }],
            optionalServices: [BATTERY_SERVICE_UUID, DEVICE_INFO_SERVICE_UUID]
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
        deviceInfoDiv.classList.remove('disabled');
        log('Connected successfully!');

        // Initial Info Fetch (One-time)
        fetchInitialDeviceInfo();

    } catch (error) {
        log('Connection failed: ' + error, 'error');
    }
}

function onDisconnected() {
    statusDiv.textContent = 'Disconnected';
    statusDiv.className = 'status disconnected';
    connectBtn.disabled = false;
    controlsDiv.classList.add('disabled');
    deviceInfoDiv.classList.add('disabled');
    log('Device disconnected', 'error');
}

function handleNotifications(event) {
    const value = new Uint8Array(event.target.value.buffer);
    logPacket('RX', value);

    const opcode = value[0];

    if (opcode === OP_NOTIFY_LOGS_COUNT) {
        // Payload: [MSB, LSB] (Big Endian)
        // Packet: [Opcode(0x79), Length(0x02), MSB, LSB, Checksum]
        const logCount = (value[2] << 8) | value[3];
        log(`Logs count: ${logCount}`, 'info');
        if (logCount > 0) {
            requestLogs();
        } else {
            log('No logs to retrieve', 'info');
        }
    } else if (opcode === OP_ANSWER_DOOR_STATUS || opcode === OP_NOTIFY_DOOR_STATUS) {
        // Payload: [Inverted?, LiveStatus]
        // value[0]=Op, value[1]=Len(02), value[2]=Inverted?, value[3]=LiveStatus
        if (value.length >= 4) {
            const isOpen = value[3] === 1;
            log(`Door is ${isOpen ? 'OPEN' : 'CLOSED'}`, 'info');
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

// Device Info Functions
async function fetchInitialDeviceInfo() {
    log('Fetching Initial Device Info...', 'info');

    // 1. Get Battery Level
    try {
        const batteryService = await server.getPrimaryService(BATTERY_SERVICE_UUID);
        const batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL_CHAR_UUID);
        const value = await batteryChar.readValue();
        const level = value.getUint8(0);
        document.getElementById('batteryLevel').textContent = `${level}%`;
        log(`Battery Level: ${level}%`, 'info');
    } catch (e) {
        log('Failed to get Battery Level: ' + e, 'error');
        document.getElementById('batteryLevel').textContent = 'Error';
    }

    // 2. Get Firmware Version
    try {
        const deviceService = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);
        const fwChar = await deviceService.getCharacteristic(SOFTWARE_REV_CHAR_UUID);
        const value = await fwChar.readValue();
        const decoder = new TextDecoder('utf-8');
        const version = decoder.decode(value);
        document.getElementById('fwVersion').textContent = version;
        log(`Firmware Version: ${version}`, 'info');
    } catch (e) {
        log('Failed to get Firmware Version: ' + e, 'error');
        document.getElementById('fwVersion').textContent = 'Error';
    }
}

// Command Functions
async function openDoor() {
    const code = document.getElementById('openCode').value?.toUpperCase();
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
    const newCode = document.getElementById('newCode').value?.toUpperCase();
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
