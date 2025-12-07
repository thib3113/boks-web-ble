// BLE Constants
const SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
const WRITE_CHAR_UUID = 'a7630002-f491-4f21-95ea-846ba586e361';
const NOTIFY_CHAR_UUID = 'a7630003-f491-4f21-95ea-846ba586e361';

const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_LEVEL_CHAR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';

const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
const DEVICE_INFO_CHARS = {
    'System ID': '00002a23-0000-1000-8000-00805f9b34fb',
    'Model Number': '00002a24-0000-1000-8000-00805f9b34fb',
    'Serial Number': '00002a25-0000-1000-8000-00805f9b34fb',
    'Firmware Revision': '00002a26-0000-1000-8000-00805f9b34fb',
    'Hardware Revision': '00002a27-0000-1000-8000-00805f9b34fb',
    'Software Revision': '00002a28-0000-1000-8000-00805f9b34fb',
    'Manufacturer Name': '00002a29-0000-1000-8000-00805f9b34fb'
};

// Opcodes
const OP_OPEN_DOOR = 0x01;
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
let currentDeviceId = null;
let storedData = {
    configKey: '',
    openCode: '',
    logs: [],
    createdCodes: []
};

// UI Elements
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusDiv = document.getElementById('status');
const controlsDiv = document.getElementById('controls');
const deviceInfoDiv = document.getElementById('deviceInfo');
const consoleLog = document.getElementById('consoleLog');
const clearLogBtn = document.getElementById('clearLogBtn');

// Event Listeners
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
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

// Storage Functions
function saveStorage() {
    if (!currentDeviceId) return;
    localStorage.setItem(`boks_${currentDeviceId}`, JSON.stringify(storedData));
}

function loadStorage() {
    if (!currentDeviceId) return;
    const data = localStorage.getItem(`boks_${currentDeviceId}`);
    if (data) {
        try {
            storedData = JSON.parse(data);

            // Restore Inputs
            if (storedData.configKey) document.getElementById('configKey').value = storedData.configKey;
            if (storedData.openCode) document.getElementById('openCode').value = storedData.openCode;

            // Render previous logs
            renderStoredLogs();

            log(`Loaded stored data for device ${currentDeviceId}`, 'info');
        } catch {
            log('Failed to parse stored data', 'error');
        }
    }
}

function renderStoredLogs() {
    const container = document.getElementById('logsContainer');
    container.innerHTML = ''; // Clear current view

    // Header
    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.padding = '5px';
    header.style.borderBottom = '2px solid #ccc';
    header.textContent = `Stored Logs (${storedData.logs.length})`;
    container.appendChild(header);

    // Render logs (newest first usually better for UI, but array is oldest first? Let's show as is)
    // Actually, appending usually puts newest at bottom.
    storedData.logs.forEach(entry => {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid #eee';
        div.style.padding = '5px';
        div.style.fontSize = '12px';

        let content = `[${new Date(entry.timestamp).toLocaleString()}] ${entry.type}`;
        if (entry.details) content += ` - ${entry.details}`;

        div.textContent = content;
        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
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
        disconnectBtn.disabled = false;
        controlsDiv.classList.remove('disabled');
        deviceInfoDiv.classList.remove('disabled');
        log('Connected successfully!');

        // Initial Info Fetch (One-time)
        fetchInitialDeviceInfo();

    } catch (error) {
        log('Connection failed: ' + error, 'error');
    }
}

function disconnect() {
    if (device && device.gatt.connected) {
        log('Disconnecting...');
        device.gatt.disconnect();
    }
}

function onDisconnected() {
    statusDiv.textContent = 'Disconnected';
    statusDiv.className = 'status disconnected';
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
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

    // 2. Get Device Information
    try {
        const deviceService = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);
        const infoContainer = document.getElementById('deviceInfoContainer'); // New container in HTML
        infoContainer.innerHTML = ''; // Clear previous

        for (const [name, uuid] of Object.entries(DEVICE_INFO_CHARS)) {
            try {
                const char = await deviceService.getCharacteristic(uuid);
                const value = await char.readValue();
                let displayValue = '';

                if (name === 'System ID') {
                    // System ID is bytes, display as Hex
                    const hexId = Array.from(new Uint8Array(value.buffer))
                        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                        .join(':');
                    displayValue = hexId;

                    // Use System ID as Device ID for storage
                    currentDeviceId = hexId;
                    log(`Device ID set to System ID: ${currentDeviceId}`, 'info');
                    loadStorage();
                } else {
                    // Others are usually text
                    const decoder = new TextDecoder('utf-8');
                    displayValue = decoder.decode(value);
                }

                // Add to UI
                const div = document.createElement('div');
                div.className = 'input-group';
                div.innerHTML = `<label>${name}:</label><span>${displayValue}</span>`;
                infoContainer.appendChild(div);

                log(`${name}: ${displayValue}`, 'info');

            } catch (charError) {
                // Characteristic not supported or read failed, skip it
                log(`${name} not available: ${charError.message}`, 'debug');
            }
        }

        // Fallback for Device ID if System ID failed
        if (!currentDeviceId) {
            currentDeviceId = device.id;
            log(`System ID not found, using instance ID: ${currentDeviceId}`, 'warning');
            loadStorage();
        }

    } catch (e) {
        log('Failed to access Device Info Service: ' + e, 'error');
        // Still try to load storage if we connected but service failed
        if (!currentDeviceId) {
             currentDeviceId = device.id;
             loadStorage();
        }
    }
}

async function openDoor() {
    const code = document.getElementById('openCode').value;
    if (!/^[0-9AB]{6}$/.test(code)) {
        log('Invalid code format. Must be 6 chars (0-9, A, B)', 'error');
        return;
    }

    // Save to storage
    storedData.openCode = code;
    saveStorage();

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

    // Save to storage
    storedData.configKey = configKey;
    storedData.createdCodes.push({
        code: newCode,
        type: type,
        index: index,
        date: Date.now()
    });
    saveStorage();

    let opcode;
    if (type === 'master') opcode = OP_CREATE_MASTER;
    else if (type === 'single') opcode = OP_CREATE_SINGLE;
    else if (type === 'multi') opcode = OP_CREATE_MULTI;

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
    const opName = OPCODE_NAMES[opcode] || `UNKNOWN_OP(0x${opcode.toString(16).toUpperCase()})`;

    // Parse details
    const details = parsePacketDetails(opcode, data);

    // Create Entry Object
    const entry = {
        timestamp: Date.now(), // Approximate capture time
        type: opName,
        opcode: opcode,
        details: details,
        raw: Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
    };

    // Add to storage if not duplicate (simple check based on raw + approximate timestamp? No, logs might be same.
    // Ideally we should deduce real timestamp from "Age", but "Age" changes.
    // Let's just append for now as requested.
    storedData.logs.push(entry);
    saveStorage();

    // Update UI
    const container = document.getElementById('logsContainer');
    const div = document.createElement('div');
    div.style.borderBottom = '1px solid #eee';
    div.style.padding = '5px';
    div.style.fontSize = '12px';

    let text = `[New] ${opName}`;
    if (details) text += ` - ${details}`;

    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => log('Service Worker registered', 'info'))
            .catch(err => log('Service Worker registration failed: ' + err, 'error'));
    });
}
