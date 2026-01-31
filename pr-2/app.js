// State
let device = null;
let server = null;
let service = null;
let writeChar = null;
let notifyChar = null;
let currentDeviceId = null;
let currentLang = localStorage.getItem('boks_lang') || 'fr';
let storedData = {
    configKey: '',
    defaultOpenCode: '',
    logs: [],
    createdCodes: []
};
let lastBatteryData = null;

// UI Elements
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusDot = document.getElementById('statusDot');
const langSelector = document.getElementById('langSelector');
const batteryTypeSelector = document.getElementById('batteryTypeSelector');

// Drawer Elements
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');

// Modals
const createCodeModal = document.getElementById('createCodeModal');

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
    }

    if (typeof translations !== 'undefined') {
        setLanguage(currentLang);
    }

    switchTab('home');
    updateConnectionState(false);
    document.getElementById('appVersionDisplay').textContent = '2.1.0';
});

// Event Listeners
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);

document.querySelectorAll('.nav-item, .drawer-item').forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        if (tab) {
            switchTab(tab);
            closeDrawer();
        }
    });
});

hamburgerBtn.addEventListener('click', openDrawer);
closeDrawerBtn.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

if (langSelector) {
    langSelector.addEventListener('change', (e) => setLanguage(e.target.value));
}

const configKeyInput = document.getElementById('configKey');
const defaultOpenCodeInput = document.getElementById('defaultOpenCode');
document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
document.getElementById('vigikToggle').addEventListener('change', toggleVigik);

document.getElementById('openDoorBtn').addEventListener('click', openDoor);

document.getElementById('refreshCodesBtn').addEventListener('click', countCodes);
document.getElementById('showCreateCodeModalBtn').addEventListener('click', showCreateModal);
document.getElementById('deleteMasterBtn').addEventListener('click', deleteMasterCode);
document.getElementById('wipeMastersBtn').addEventListener('click', wipeMasterCodes);

document.getElementById('closeModalBtn').addEventListener('click', () => createCodeModal.classList.remove('visible'));
document.getElementById('confirmCreateCodeBtn').addEventListener('click', createCode);
document.getElementById('modalCodeType').addEventListener('change', (e) => {
    document.getElementById('modalIndexGroup').style.display = e.target.value === 'master' ? 'block' : 'none';
});

document.getElementById('getLogsBtn').addEventListener('click', getLogs);
document.getElementById('clearLogBtn').addEventListener('click', () => document.getElementById('consoleLog').innerHTML = '');

batteryTypeSelector.addEventListener('change', () => {
    if (lastBatteryData) parseBatteryInfo(lastBatteryData);
});

// --- Core Functions ---

function updateConnectionState(connected) {
    const disabled = !connected;
    const ids = [
        'openDoorBtn', 'refreshCodesBtn', 'showCreateCodeModalBtn',
        'deleteMasterBtn', 'wipeMastersBtn', 'getLogsBtn', 'vigikToggle'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
    });
    if (connected) updateHomeUI();
}

function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
}

function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item, .drawer-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) navItem.classList.add('active');

    const drawerItem = document.querySelector(`.drawer-item[data-tab="${tabId}"]`);
    if (drawerItem) drawerItem.classList.add('active');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('boks_lang', lang);
    if (langSelector) langSelector.value = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                el.placeholder = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });
}

function saveConfig() {
    storedData.configKey = configKeyInput.value;
    storedData.defaultOpenCode = defaultOpenCodeInput.value;
    saveStorage();
    alert(currentLang === 'fr' ? 'Configuration enregistrée' : 'Configuration saved');
    updateHomeUI();
}

function updateHomeUI() {
    const homeInput = document.getElementById('homeOpenCode');
    const openBtn = document.getElementById('openDoorBtn');

    if (storedData.defaultOpenCode) {
        homeInput.value = storedData.defaultOpenCode;
    }

    if (device && device.gatt.connected) {
        openBtn.disabled = false;
    } else {
        openBtn.disabled = true;
    }
}

function saveStorage() {
    if (!currentDeviceId) return;
    localStorage.setItem(`boks_${currentDeviceId}`, JSON.stringify(storedData));
}

function loadStorage() {
    if (!currentDeviceId) return;
    const data = localStorage.getItem(`boks_${currentDeviceId}`);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            storedData = { ...storedData, ...parsed };
            // Init createdCodes if missing
            if (!storedData.createdCodes) storedData.createdCodes = [];

            configKeyInput.value = storedData.configKey || '';
            defaultOpenCodeInput.value = storedData.defaultOpenCode || '';
            updateHomeUI();
            renderCreatedCodes();

            if (!storedData.configKey) switchTab('config');
        } catch (e) {
            console.error('Storage error', e);
        }
    } else {
        switchTab('config');
        renderCreatedCodes();
    }
}

function renderCreatedCodes() {
    const list = document.getElementById('createdCodesList');
    if (!list) return;
    list.innerHTML = '';

    // Sort by date desc
    const codes = (storedData.createdCodes || []).sort((a,b) => b.date - a.date);

    if (codes.length === 0) {
        list.innerHTML = '<div style="color:#999; text-align:center; padding:10px;">-</div>';
        return;
    }

    codes.forEach(c => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.borderBottom = '1px solid #eee';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        const typeLabel = c.type === 'master' ? 'P' : 'S';
        const dateStr = new Date(c.date).toLocaleDateString();
        const statusIcon = c.status === 'used' ? '✅' : '⏳';

        div.innerHTML = `
            <div>
                <strong>${c.code}</strong> <small class="type-badge" style="background:#eee; padding:2px 4px; border-radius:4px;">${typeLabel}</small>
            </div>
            <div style="font-size:0.8rem; color:#666;">
                ${dateStr} ${statusIcon}
            </div>
        `;
        list.appendChild(div);
    });
}

// --- BLE Functions ---

async function connect() {
    const btStatus = checkWebBluetoothAvailability();
    if (!btStatus.isAvailable) {
        const w = document.getElementById('webBluetoothWarning');
        w.style.display = 'block';
        w.textContent = btStatus.message;
        return;
    }

    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE_UUID] }],
            optionalServices: [BATTERY_SERVICE_UUID, DEVICE_INFO_SERVICE_UUID]
        });

        currentDeviceId = device.id;
        device.addEventListener('gattserverdisconnected', onDisconnected);

        server = await device.gatt.connect();
        service = await server.getPrimaryService(SERVICE_UUID);
        writeChar = await service.getCharacteristic(WRITE_CHAR_UUID);
        notifyChar = await service.getCharacteristic(NOTIFY_CHAR_UUID);

        await notifyChar.startNotifications();
        notifyChar.addEventListener('characteristicvaluechanged', handleNotifications);

        statusDot.className = 'status-dot connected';
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';

        updateConnectionState(true);
        loadStorage();
        fetchInitialDeviceInfo();
        updateBatteryInfo();

    } catch (error) {
        console.error(error);
    }
}

function disconnect() {
    if (device && device.gatt.connected) device.gatt.disconnect();
}

function onDisconnected() {
    statusDot.className = 'status-dot disconnected';
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
    document.getElementById('headerBatteryCard').style.display = 'none';

    updateConnectionState(false);
    log('Device disconnected', 'warning');
}

async function sendPacket(packet) {
    if (!device || !device.gatt.connected || !writeChar) {
        log('Erreur: Non connecté', 'error');
        alert(translations[currentLang].status_disconnected || 'Disconnected');
        return;
    }
    try {
        logPacket('TX', packet);
        await writeChar.writeValue(packet);
    } catch (e) {
        log('Send failed: ' + e, 'error');
    }
}

function handleNotifications(event) {
    const value = new Uint8Array(event.target.value.buffer);
    logPacket('RX', value);
    const opcode = value[0];

    if (opcode === OP_NOTIFY_CODES_COUNT) {
        if (value.length >= 6) {
            const m = (value[2] << 8) | value[3];
            const s = (value[4] << 8) | value[5];
            document.getElementById('countMaster').textContent = m;
            document.getElementById('countSingle').textContent = s;

            if (createCodeModal.classList.contains('visible')) {
                createCodeModal.classList.remove('visible');
                alert(translations[currentLang].code_created || 'Succès');
            }
        }
    }
    else if (opcode === 0x78) { // ERROR
        alert('Erreur opération code (0x78)');
    }
    else if (opcode === OP_NOTIFY_LOGS_COUNT) {
        const count = (value[2] << 8) | value[3];
        if (count > 0) requestLogs();
    }
    else if (opcode === OP_ANSWER_DOOR_STATUS || opcode === OP_NOTIFY_DOOR_STATUS) {
        if (value.length >= 4) {
            const isOpen = value[3] === 1;
            const statusStr = isOpen ? 'OUVERT' : 'FERMÉ';
            document.getElementById('doorStatus').textContent = `Status: ${statusStr}`;
            setTimeout(updateBatteryInfo, 500);
        }
    }
    else if (opcode === OP_NOTIFY_SET_CONFIGURATION_SUCCESS) {
        alert(translations[currentLang].config_success || 'OK');
    }
    else if (opcode >= 0x86 && opcode <= 0xA2) {
        parseLogEvent(value);
    }
}

// Features

async function openDoor() {
    const code = document.getElementById('homeOpenCode').value;
    if (!code || code.length !== 6) {
        alert(translations[currentLang].alert_code_length);
        return;
    }
    const packet = new Uint8Array(8);
    packet[0] = OP_OPEN_DOOR;
    packet[1] = 0x06;
    for (let i = 0; i < 6; i++) packet[2+i] = code.charCodeAt(i);
    await sendPacket(packet);
}

function showCreateModal() {
    if (!storedData.configKey) {
        alert(translations[currentLang].missing_key);
        switchTab('config');
        return;
    }
    createCodeModal.classList.add('visible');
}

async function createCode() {
    const newCode = document.getElementById('modalNewCode').value;
    const type = document.getElementById('modalCodeType').value;
    const index = parseInt(document.getElementById('modalCodeIndex').value);
    const configKey = storedData.configKey;

    if (!configKey) return;
    if (newCode.length !== 6) {
        alert(translations[currentLang].alert_code_length);
        return;
    }

    let opcode;
    if (type === 'master') opcode = OP_CREATE_MASTER;
    else if (type === 'single') opcode = OP_CREATE_SINGLE;

    const packet = new Uint8Array(type === 'master' ? 18 : 17);
    let p = 0;
    packet[p++] = opcode;
    packet[p++] = type === 'master' ? 15 : 14;
    for (let i=0; i<8; i++) packet[p++] = configKey.charCodeAt(i);
    for (let i=0; i<6; i++) packet[p++] = newCode.charCodeAt(i);
    if (type === 'master') packet[p++] = index;

    let cs = 0;
    for (let i=0; i<p; i++) cs = (cs + packet[i]) % 256;
    packet[p++] = cs;

    await sendPacket(packet);

    // Store Locally
    if (!storedData.createdCodes) storedData.createdCodes = [];
    storedData.createdCodes.push({
        code: newCode,
        type: type,
        index: (type === 'master' ? index : null),
        date: Date.now(),
        status: 'pending'
    });
    saveStorage();
    renderCreatedCodes();
}

async function deleteMasterCode() {
    const index = parseInt(document.getElementById('deleteIndex').value);
    if (isNaN(index)) return;
    await deleteMasterCodeByIndex(index);
}

async function deleteMasterCodeByIndex(index) {
    const configKey = storedData.configKey;
    if (!configKey) {
        alert(translations[currentLang].missing_key);
        switchTab('config');
        return;
    }

    const packet = new Uint8Array(12);
    let p = 0;
    packet[p++] = OP_DELETE_MASTER_CODE;
    packet[p++] = 0x09;
    for (let i=0; i<8; i++) packet[p++] = configKey.charCodeAt(i);
    packet[p++] = index;
    let cs = 0;
    for (let i=0; i<p; i++) cs = (cs + packet[i]) % 256;
    packet[p++] = cs;

    await sendPacket(packet);
}

async function wipeMasterCodes() {
    if (!confirm(translations[currentLang].wipe_confirm || 'Sûr ?')) return;

    log('Wipe started...', 'info');
    await countCodes();
    await new Promise(r => setTimeout(r, 1000));

    let maxPasses = 3;
    for (let pass = 1; pass <= maxPasses; pass++) {
        log(`Wipe Pass ${pass}...`, 'info');
        for (let i = 0; i <= 255; i++) {
             await deleteMasterCodeByIndex(i);
             await new Promise(r => setTimeout(r, 50));
        }
        await countCodes();
        await new Promise(r => setTimeout(r, 1500));

        const currentCount = parseInt(document.getElementById('countMaster').textContent) || 0;
        log(`Remaining: ${currentCount}`, 'info');
        if (currentCount === 0) break;
    }
    log('Wipe finished.', 'success');
}

async function countCodes() {
    await sendPacket(new Uint8Array([OP_COUNT_CODES, 0x00, OP_COUNT_CODES]));
}

async function toggleVigik(e) {
    const enabled = e.target.checked;
    const configKey = storedData.configKey;
    if (!configKey) {
        e.target.checked = !enabled;
        alert(translations[currentLang].missing_key);
        switchTab('config');
        return;
    }
    const packet = new Uint8Array(13);
    let p = 0;
    packet[p++] = OP_SET_CONFIGURATION;
    packet[p++] = 0x0A;
    for (let i=0; i<8; i++) packet[p++] = configKey.charCodeAt(i);
    packet[p++] = 0x01;
    packet[p++] = enabled ? 0x01 : 0x00;
    let cs = 0;
    for (let i=0; i<p; i++) cs = (cs + packet[i]) % 256;
    packet[p++] = cs;
    await sendPacket(packet);
}

async function getLogs() {
    await sendPacket(new Uint8Array([OP_GET_LOGS_COUNT, 0x00, OP_GET_LOGS_COUNT]));
}

async function requestLogs() {
    await sendPacket(new Uint8Array([OP_REQUEST_LOGS, 0x00, OP_REQUEST_LOGS]));
}

// Helpers

async function updateBatteryInfo() {
     try {
        if (!device || !device.gatt.connected) return;
        const services = await server.getPrimaryServices();
        let char = null;
        for (const s of services) {
            try { char = await s.getCharacteristic(CUSTOM_BATTERY_CHAR_UUID); break; } catch (e) {}
        }
        if (char) {
            const value = await char.readValue();
            lastBatteryData = value;
            parseBatteryInfo(value);
        }
    } catch (e) { log('Bat err: ' + e, 'warning'); }
}

function parseBatteryInfo(value) {
    const data = new Uint8Array(value.buffer);
    const len = data.length;
    let voltages = { first: '-', min: '-', mean: '-', max: '-', last: '-' };
    let alertVoltage = null;
    let temp = '-';

    const batteryAlertEl = document.getElementById('batteryAlert');
    batteryAlertEl.style.display = 'none';

    if (len === 6) {
        voltages.first = data[0] * 100;
        voltages.min = data[1] * 100;
        voltages.mean = data[2] * 100;
        voltages.max = data[3] * 100;
        voltages.last = data[4] * 100;
        temp = (data[5] - 25) + '°C';
        alertVoltage = Math.min(voltages.min, voltages.last);
    } else if (len === 4) {
        voltages.first = data[0] * 100 + ' (T1)';
        voltages.min = data[1] !== 255 ? data[1] * 100 + ' (T5)' : '-';
        voltages.mean = data[2] !== 255 ? data[2] * 100 + ' (T10)' : '-';
        temp = (data[3] - 25) + '°C';
        if (data[0] > 0) alertVoltage = data[0] * 100;
    } else if (len === 1) {
        voltages.first = data[0] + '%';
    }

    const levelStr = String(voltages.first).includes('(') ? voltages.first.split(' ')[0] : (typeof voltages.first === 'number' ? (voltages.first/1000).toFixed(1) + 'V' : voltages.first);
    document.getElementById('headerBatteryCard').style.display = 'block';
    document.getElementById('headerBatteryLevel').textContent = levelStr;
    document.getElementById('batLevel').textContent = levelStr;
    document.getElementById('batTemp').textContent = temp;

    document.getElementById('batVFirst').textContent = voltages.first;
    document.getElementById('batVMin').textContent = voltages.min;
    document.getElementById('batVMean').textContent = voltages.mean;
    document.getElementById('batVMax').textContent = voltages.max;
    document.getElementById('batVLast').textContent = voltages.last;

    analyzeBatteryHealth(alertVoltage, batteryAlertEl);
}

function analyzeBatteryHealth(voltage_mV, alertEl) {
    if (!voltage_mV || isNaN(voltage_mV)) return;
    const type = batteryTypeSelector.value;
    let msg = '';
    if (type === 'aaa') {
        if (voltage_mV < 7200) msg = 'CRITICAL';
        else if (voltage_mV < 8000) msg = 'LOW';
        else if (voltage_mV < 9600) msg = 'WARNING';
    } else {
        if (voltage_mV < 3000) msg = 'CRITICAL';
        else if (voltage_mV <= 3300) msg = 'URGENT';
    }
    if (msg) {
        alertEl.style.display = 'block';
        alertEl.textContent = msg;
    }
}

function parseLogEvent(data) {
    const op = data[0];
    const opName = OPCODE_NAMES[op] || 'UNK';
    const div = document.createElement('div');

    // Check if valid opening/usage to mark code as used
    // 0x86: CODE_BLE_VALID_HISTORY
    // 0x87: CODE_KEY_VALID_HISTORY
    if (op === 0x86 || op === 0x87) {
        // Payload: [AGE(3), CODE(6)...]
        // 0x86 len 17 -> Age at 2,3,4. Code at 5..10
        // 0x87 len 9 -> Age at 2,3,4. Code at 5..10
        if (data.length >= 11) {
            const codeBytes = data.slice(5, 11);
            const codeStr = new TextDecoder().decode(codeBytes);

            // Find match
            if (storedData.createdCodes) {
                const match = storedData.createdCodes.find(c => c.code === codeStr && c.type === 'single' && c.status !== 'used');
                if (match) {
                    match.status = 'used';
                    saveStorage();
                    renderCreatedCodes();
                    log(`Code ${codeStr} marked as used`, 'success');
                }
            }
        }
    }

    const details = parsePacketDetails(op, data);
    div.textContent = `[${new Date().toLocaleTimeString()}] ${opName} ${details}`;
    div.style.borderBottom = '1px solid #eee';
    document.getElementById('logsContainer').prepend(div);
}

// ... include logging helpers and checkWebBluetoothAvailability from before ...
function fetchInitialDeviceInfo() {
    // ... same as before
    try {
        const infoService = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);
        const char = await infoService.getCharacteristic('00002a26-0000-1000-8000-00805f9b34fb');
        const value = await char.readValue();
        const fwRev = new TextDecoder().decode(value).replace(/\0/g, '');
        
        log(`FW: ${fwRev}`, 'info');
        document.getElementById('deviceInfoContainer').textContent = `Firmware: ${fwRev}`;

        if (isVigikCompatible(fwRev)) {
            document.getElementById('vigikCard').style.display = 'block';
        }

    } catch (e) {
        log('Info error', 'warning');
    }
}

function isVigikCompatible(fw) {
    if (fw.toLowerCase().includes('10/125')) return true;
    const ver = parseFloat(fw);
    if (!isNaN(ver) && ver >= 4.2) return true;
    return false;
}

// Logging
function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.style.color = type === 'error' ? '#f55' : (type === 'rx' ? '#ffb74d' : (type === 'tx' ? '#4fc3f7' : '#0f0'));
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    const c = document.getElementById('consoleLog');
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
}

function logPacket(label, data) {
    const opcode = data[0];
    const opName = OPCODE_NAMES[opcode] || 'UNK';
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    log(`${label}: [${opName}] ${hex}`, label === 'TX' ? 'tx' : 'rx');
}
