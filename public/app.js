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
    // Check Web Bluetooth API availability
    const btStatus = checkWebBluetoothAvailability();
    if (!btStatus.isAvailable) {
        const warningDiv = document.getElementById('webBluetoothWarning');
        if (warningDiv) {
            warningDiv.innerHTML = btStatus.message;
            warningDiv.style.display = 'block';
        }
        connectBtn.disabled = true;
        log(btStatus.message, 'error'); // Also log to internal console
        return; // Stop connection attempt
    }

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
    analyzeBatteryHealth(alertVoltage);
}

function analyzeBatteryHealth(voltage_mV) {
    if (!voltage_mV || isNaN(voltage_mV)) return;

    const type = batteryTypeSelector.value;
    let alertLevel = 'OK';
    let msg = '';

    if (type === 'aaa') {
        // AAA Logic
        if (voltage_mV < 7200) {
            alertLevel = 'CRITICAL';
            msg = `CRITICAL (${voltage_mV}mV): Replace 8x AAA immediately!`;
        } else if (voltage_mV < 8000) {
            alertLevel = 'ALARM';
            msg = `LOW (${voltage_mV}mV): Shutdown imminent.`;
        } else if (voltage_mV < 9600) {
            alertLevel = 'LOW';
            msg = `WARNING (${voltage_mV}mV): ~20-30% remaining.`;
        }
    } else {
        // LSH14 Logic
        if (voltage_mV < 3000) {
            alertLevel = 'CRITICAL';
            msg = `CRITICAL (${voltage_mV}mV): Battery empty! Replace LSH14.`;
        } else if (voltage_mV <= 3300) {
            alertLevel = 'ALARM';
            msg = `URGENT (${voltage_mV}mV): End of life (<5%). Replace LSH14.`;
        }
    }

    if (alertLevel !== 'OK') {
        batteryAlertEl.style.display = 'block';
        batteryAlertMsgEl.innerHTML = msg;
    }
}

async function updateBatteryInfo() {
    try {
        const services = await server.getPrimaryServices();
        let char = null;

        // Search for Prop Battery Char
        for (const s of services) {
            try {
                char = await s.getCharacteristic(CUSTOM_BATTERY_CHAR_UUID);
                break;
            } catch (e) {}
        }

        if (char) {
            const value = await char.readValue();
            lastBatteryData = value; // Store for type toggling
            parseBatteryInfo(value);
        } else {
            log('Battery characteristic not found', 'warning');
        }
    } catch (e) {
        log('Failed to read battery: ' + e, 'error');
    }
}

async function fetchInitialDeviceInfo() {
    try {
        const infoService = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);
        const char = await infoService.getCharacteristic('00002a26-0000-1000-8000-00805f9b34fb'); // Firmware Revision
        const value = await char.readValue();
        const fwRev = new TextDecoder().decode(value).replace(/\0/g, '');
        
        log(`Firmware Revision: ${fwRev}`, 'info');
        
        const inference = inferHardwareFromFirmware(fwRev);
        if (inference.battery !== 'unknown') {
            log(`Auto-detected: Boks v${inference.version} using ${inference.label}`, 'success');
            
            // Auto-select in UI
            if (batteryTypeSelector.value !== inference.battery) {
                batteryTypeSelector.value = inference.battery;
                batteryTypeSelector.dispatchEvent(new Event('change'));
                log(`Switched battery profile to ${inference.label}`, 'info');
            }
            
            // Show toast or small info
            const infoDiv = document.createElement('div');
            infoDiv.style.padding = '5px';
            infoDiv.style.backgroundColor = '#e8f0fe';
            infoDiv.style.color = '#1a73e8';
            infoDiv.style.fontSize = '0.9em';
            infoDiv.style.marginTop = '5px';
            infoDiv.textContent = `Hardware: v${inference.version} (${inference.label})`;
            deviceInfoDiv.insertBefore(infoDiv, deviceInfoDiv.firstChild);
        }
    } catch (e) {
        log('Could not read Device Info (normal for some fw): ' + e, 'warning');
    }
}

async function openDoor() {
    const code = document.getElementById('openCode').value;
    if (code.length !== 6) {
        alert('Code must be 6 characters');
        return;
    }
    
    // Packet: [0x01, 0x06, C, O, D, E, X, X]
    const packet = new Uint8Array(8);
    packet[0] = OP_OPEN_DOOR;
    packet[1] = 0x06; // Length
    for (let i = 0; i < 6; i++) {
        packet[2+i] = code.charCodeAt(i);
    }
    
    await sendPacket(packet);
}

async function createCode() {
    const configKey = document.getElementById('configKey').value;
    const newCode = document.getElementById('newCode').value;
    const type = document.getElementById('codeType').value;
    const index = parseInt(document.getElementById('codeIndex').value);

    if (configKey.length !== 8) {
        alert('Config Key must be 8 characters');
        return;
    }
    if (newCode.length !== 6) {
        alert('New Code must be 6 characters');
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

// Service Worker & Version Management
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('sw.js');
            log('Service Worker enregistré', 'info');
            
            // Check for updates
            checkForUpdate();
            // Check every 60 seconds
            setInterval(checkForUpdate, 60000);
            
            // Handle Update Button
            document.getElementById('updateBtn').addEventListener('click', async () => {
                const btn = document.getElementById('updateBtn');
                btn.disabled = true;
                btn.textContent = 'Mise à jour...';
                
                // 1. Unregister SW
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                
                // 2. Clear Caches
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                
                // 3. Reload
                window.location.reload(true);
            });

        } catch (err) {
            log('Échec de l\'enregistrement du Service Worker : ' + err, 'error');
        }
    });
}

async function checkForUpdate() {
    try {
        const response = await fetch('version.json', { cache: 'no-store' });
        if (!response.ok) return;
        
        const data = await response.json();
        const serverVersion = data.version;
        const localVersion = localStorage.getItem('app_version');

        if (localVersion && localVersion !== serverVersion) {
            // Version mismatch! Show notification
            document.getElementById('updateNotification').style.display = 'block';
            log(`Nouvelle version disponible : ${serverVersion} (Actuelle : ${localVersion})`, 'info');
        } else {
            // First run or same version, update local storage
            localStorage.setItem('app_version', serverVersion);
        }
    } catch (e) {
        console.error('Failed to check version:', e);
    }
}
