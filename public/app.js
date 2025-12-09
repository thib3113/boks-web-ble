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

// Battery UI Elements
const batteryFormatEl = document.getElementById('batteryFormat');
const batteryTempEl = document.getElementById('batteryTemp');
const batVFirstEl = document.getElementById('batVFirst');
const batVMinEl = document.getElementById('batVMin');
const batVMeanEl = document.getElementById('batVMean');
const batVMaxEl = document.getElementById('batVMax');
const batVLastEl = document.getElementById('batVLast');
const batteryAlertEl = document.getElementById('batteryAlert');
const batteryAlertMsgEl = document.getElementById('batteryAlertMsg');
const batteryWaitingEl = document.getElementById('batteryWaiting');
const batteryDataEl = document.getElementById('batteryData');
const batteryTypeSelector = document.getElementById('batteryTypeSelector');
const batteryImage = document.getElementById('batteryImage');

let lastBatteryData = null;

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

batteryTypeSelector.addEventListener('change', () => {
    const type = batteryTypeSelector.value;
    if (type === 'aaa') {
        batteryImage.src = 'https://www.batteries4pro.com/25694-pos_thickbox/10-piles-alcaline-industrial-pro-varta-aaa-lr03.jpg';
    } else {
        batteryImage.src = 'https://www.mega-piles.com/img/p/61/4587_default.jpg';
    }
    // Re-parse with new type if data available
    if (lastBatteryData) {
        parseBatteryInfo(lastBatteryData);
    }
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

            // Trigger battery update after door event (wait for stabilization)
            setTimeout(updateBatteryInfo, 500);
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

// Battery Parsing Logic
function parseBatteryInfo(value) {
    const data = new Uint8Array(value.buffer);
    const len = data.length;
    let format = 'Unknown';
    let temp = null;
    let voltages = { first: '-', min: '-', mean: '-', max: '-', last: '-' };
    let alertVoltage = null;

    // Reset Alert
    batteryAlertEl.style.display = 'none';
    batteryWaitingEl.style.display = 'none';
    batteryDataEl.style.display = 'block';

    if (len === 6) {
        format = 'measures-first-min-mean-max-last';
        // Values are in deci-volts (e.g. 42 = 4.2V). Convert to mV (* 100).
        voltages.first = data[0] * 100;
        voltages.min = data[1] * 100;
        voltages.mean = data[2] * 100;
        voltages.max = data[3] * 100;
        voltages.last = data[4] * 100;

        temp = data[5] - 25;

        // Alert on Min or Last
        alertVoltage = Math.min(voltages.min, voltages.last);

    } else if (len === 4) {
        format = 'measures-t1-t5-t10';
        voltages.first = data[0] * 100 + ' (T1)';
        voltages.min = data[1] !== 255 ? data[1] * 100 + ' (T5)' : '-';
        voltages.mean = data[2] !== 255 ? data[2] * 100 + ' (T10)' : '-';

        temp = data[3] - 25;

        if (data[0] > 0) alertVoltage = data[0] * 100;

    } else if (len === 1) {
        format = 'measure-single';
        voltages.first = data[0] + '%'; // Standard level
    }

    // Update UI
    batteryFormatEl.textContent = format;
    batteryTempEl.textContent = temp !== null ? `${temp}°C` : '-';

    batVFirstEl.textContent = voltages.first;
    batVMinEl.textContent = voltages.min;
    batVMeanEl.textContent = voltages.mean;
    batVMaxEl.textContent = voltages.max;
    batVLastEl.textContent = voltages.last;

    // Check Alert based on Selected Battery Type
    lastBatteryData = value;
    const selectedType = batteryTypeSelector.value;
    const currentLevel = data[0];

    if (alertVoltage !== null && alertVoltage > 0) {
        let status = 'OK';

        if (selectedType === 'aaa') {
            // === 8x AAA LOGIC ===
            if (alertVoltage < 7200) {
                showAlert('#b71c1c', '#ffebee', '#b71c1c',
                    `<strong>EMPTY (${alertVoltage}mV):</strong> Electronics failing. Replace 8x AAA immediately.`);
                log(`BATTERY (AAA) CUTOFF: ${alertVoltage}mV`, 'error');
                status = 'CUTOFF';
            } else if (alertVoltage < 8000) {
                showAlert('#ef5350', '#ffebee', '#c62828',
                    `CRITICAL (${alertVoltage}mV): Shutdown imminent. Leakage risk. Replace 8x AAA.`);
                log(`BATTERY (AAA) ALARM: ${alertVoltage}mV`, 'warning');
                status = 'ALARM';
            } else if (alertVoltage < 9600) {
                showAlert('#ffb74d', '#fff3e0', '#e65100',
                    `LOW (${alertVoltage}mV): ~20-30% remaining. Plan replacement.`);
                log(`BATTERY (AAA) WARNING: ${alertVoltage}mV`, 'warning');
                status = 'WARNING';
            } else {
                batteryAlertEl.style.display = 'none';
            }
        } else {
            // === LSH14 LOGIC ===

            // Special Case: Config Mismatch (Level 0% but Voltage Good)
            if (currentLevel === 0 && alertVoltage > 3300) {
                 showAlert('#ffb74d', '#fff3e0', '#e65100',
                    `<strong>CONFIG MISMATCH?</strong> Voltage (${alertVoltage}mV) is good for LSH14, but Level is 0% (AAA scale). Check device config.`);
                 log(`BATTERY MISMATCH: ${alertVoltage}mV / 0%`, 'warning');
                 status = 'MISMATCH';
            }
            else if (alertVoltage < 3000) {
                showAlert('#ef5350', '#ffebee', '#c62828',
                    `<strong>CRITICAL (${alertVoltage}mV):</strong> Battery empty (<3.0V). Drop to 0V imminent. Replace LSH14 immediately.`);
                log(`BATTERY (LSH14) CRITICAL: ${alertVoltage}mV`, 'error');
                status = 'CRITICAL';
            } else if (alertVoltage <= 3300) {
                showAlert('#ffb74d', '#fff3e0', '#e65100',
                    `URGENT (${alertVoltage}mV): Leaving stable plateau. <5% remaining. Replace LSH14 immediately.`);
                log(`BATTERY (LSH14) WARNING: ${alertVoltage}mV`, 'warning');
                status = 'WARNING';
            } else {
                batteryAlertEl.style.display = 'none';
            }
        }

        // Update format text
        batteryFormatEl.textContent = `${format} [${selectedType.toUpperCase()}]`;
    }
}

function showAlert(borderColor, bgColor, textColor, htmlMsg) {
    batteryAlertEl.style.display = 'block';
    batteryAlertEl.style.borderColor = borderColor;
    batteryAlertEl.style.backgroundColor = bgColor;
    batteryAlertEl.style.color = textColor;
    batteryAlertMsgEl.innerHTML = htmlMsg;
}

async function updateBatteryInfo() {
    log('Updating Battery Info...', 'info');
    try {
        // Try reading from Main Service (where custom char usually resides)
        // Ensure 'service' is the Main Service (A763...)
        if (!service) return;

        const char = await service.getCharacteristic(CUSTOM_BATTERY_CHAR_UUID);
        const value = await char.readValue();
        parseBatteryInfo(value);
        log('Battery Info Updated', 'info');
    } catch (e) {
        log('Failed to read Custom Battery Info: ' + e, 'warning');
        // If failed, maybe try Battery Service? Already done in initial.
    }
}

// Device Info Functions
async function fetchInitialDeviceInfo() {
    log('Fetching Initial Device Info...', 'info');

    // 1. Get Battery Level (Standard)
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

    // NOTE: Advanced Battery Info is NOT fetched here.
    // It requires a fresh door opening event to be accurate.
    // Use the "Waiting for door opening..." placeholder.

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
