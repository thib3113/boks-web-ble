// State
let device = null;
let server = null;
let mainService = null;
let writeChar = null;
let notifyChar = null;
let isWaitingForClose = false;
let currentStepId = 'step1';

let collectedData = {
    timestamp: null,
    deviceInfo: {},
    userInputs: {},
    extraData: {},
    batteryData: {},
    questionAnswers: []
};

// Reference Values
const REF_VALUES = {
    'Model Number': '2.0',
    'Firmware Revision': '10/125',
    'Software Revision': ['4.3.3', '4.2.0'], // Array of valid versions
    'Manufacturer Name': 'BOKS'
};

// UI Elements
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const deviceInfoResults = document.getElementById('deviceInfoResults');
const deviceInfoGrid = document.getElementById('deviceInfoGrid');
const deviceInfoCheck = document.getElementById('deviceInfoCheck');
const extraDataGrid = document.getElementById('extraDataGrid');
const conditionalQuestions = document.getElementById('conditionalQuestions');
const questionsContainer = document.getElementById('questionsContainer');
const nextStep1Btn = document.getElementById('nextStep1');

const openCodeInput = document.getElementById('openCode');
const openDoorBtn = document.getElementById('openDoorBtn');
const doorStatus = document.getElementById('doorStatus');
const batteryStatus = document.getElementById('batteryStatus');
const batteryResult = document.getElementById('batteryResult');
const nextStep2Btn = document.getElementById('nextStep2');
const prevStep2Btn = document.getElementById('prevStep2');

const customServiceUuidInput = document.getElementById('customServiceUuid');
const exploreServiceBtn = document.getElementById('exploreServiceBtn');
const serviceExplorationLog = document.getElementById('serviceExplorationLog');
const prevStep3Btn = document.getElementById('prevStep3');
const finishBtn = document.getElementById('finishBtn');
const prevStep4Btn = document.getElementById('prevStep4');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const jsonRecap = document.getElementById('jsonRecap');

// Navigation
function showStep(stepId) {
    currentStepId = stepId;
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

nextStep1Btn.addEventListener('click', () => showStep('step2'));
nextStep2Btn.addEventListener('click', () => showStep('step3'));
prevStep2Btn.addEventListener('click', () => showStep('step1'));
prevStep3Btn.addEventListener('click', () => showStep('step2'));
finishBtn.addEventListener('click', () => {
    generateRecap();
    showStep('step4');
});
prevStep4Btn.addEventListener('click', () => showStep('step3'));

copyJsonBtn.addEventListener('click', () => {
    jsonRecap.select();
    document.execCommand('copy');
    alert('JSON copié dans le presse-papier !');
});

// Step 1: Connection & Device Info
async function connectToBoks(resetData = true) {
    if (resetData) {
        // Reset Data
        collectedData = {
            timestamp: new Date().toISOString(),
            deviceInfo: {},
            userInputs: {
                boksType: document.getElementById('boksType').value,
                hasScale: document.getElementById('hasScale').checked
            },
            extraData: {},
            batteryData: {},
            questionAnswers: []
        };
    }

    try {
        connectionStatus.style.display = 'block';
        connectionStatus.textContent = resetData ? 'Recherche de Boks...' : 'Reconnexion...';
        connectionStatus.className = 'status-message';

        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE_UUID] }],
            optionalServices: [BATTERY_SERVICE_UUID, DEVICE_INFO_SERVICE_UUID]
        });

        device.addEventListener('gattserverdisconnected', onDisconnected);

        connectionStatus.textContent = 'Connexion en cours...';
        server = await device.gatt.connect();

        connectionStatus.textContent = 'Connecté ! Lecture des informations...';
        connectionStatus.className = 'status-message success';
        
        hideReconnectUI();
        
        const version = await fetchDeviceInfo();
        
        // Setup Main Service for Step 2 & Extra Data
        mainService = await server.getPrimaryService(SERVICE_UUID);
        writeChar = await mainService.getCharacteristic(WRITE_CHAR_UUID);
        notifyChar = await mainService.getCharacteristic(NOTIFY_CHAR_UUID);
        await notifyChar.startNotifications();
        notifyChar.addEventListener('characteristicvaluechanged', handleNotifications);

        // Fetch Extra Data
        await fetchExtraData(version);

        // Show Conditional Questions
        showConditionalQuestions(version);

        nextStep1Btn.disabled = false;

    } catch (error) {
        console.error(error);
        connectionStatus.textContent = 'Erreur : ' + error;
        connectionStatus.className = 'status-message error';
        if (!resetData) {
            alert('Impossible de se reconnecter : ' + error);
        }
    }
}

connectBtn.addEventListener('click', () => connectToBoks(true));

function onDisconnected() {
    isWaitingForClose = false;
    if (currentStepId === 'step4') return;

    showReconnectUI();
    
    if (currentStepId === 'step1') {
        connectionStatus.textContent = 'Appareil déconnecté.';
        connectionStatus.className = 'status-message error';
    }
}

function showReconnectUI() {
    let banner = document.getElementById('reconnect-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'reconnect-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #d93025;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Appareil déconnecté';
        text.style.fontWeight = 'bold';
        
        const btn = document.createElement('button');
        btn.textContent = 'Reconnecter';
        btn.style.cssText = `
            background-color: white;
            color: #d93025;
            border: none;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin: 0;
        `;
        btn.onclick = () => connectToBoks(false);
        
        banner.appendChild(text);
        banner.appendChild(btn);
        document.body.appendChild(banner);
    }
    banner.style.display = 'flex';
}

function hideReconnectUI() {
    const banner = document.getElementById('reconnect-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

async function fetchDeviceInfo() {
    deviceInfoResults.style.display = 'block';
    deviceInfoGrid.innerHTML = '';
    let allMatch = true;
    let softwareVersion = '0.0.0';

    try {
        const service = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);

        const ALLOWED_CHARS = ['Model Number', 'Firmware Revision', 'Software Revision', 'Manufacturer Name'];
        for (const [name, uuid] of Object.entries(DEVICE_INFO_CHARS)) {
            if (!ALLOWED_CHARS.includes(name)) continue;

            try {
                const char = await service.getCharacteristic(uuid);
                const value = await char.readValue();
                const decoder = new TextDecoder('utf-8');
                const textValue = decoder.decode(value).replace(/\0/g, ''); // Remove null bytes

                if (name === 'Software Revision') {
                    softwareVersion = textValue;
                }

                const divLabel = document.createElement('div');
                divLabel.className = 'info-label';
                divLabel.textContent = name + ':';

                const divValue = document.createElement('div');
                divValue.textContent = textValue;

                // Store in collectedData
                collectedData.deviceInfo[name] = textValue;

                // Check against reference
                if (REF_VALUES[name]) {
                    let isValid = false;
                    if (Array.isArray(REF_VALUES[name])) {
                        isValid = REF_VALUES[name].includes(textValue);
                    } else {
                        isValid = textValue === REF_VALUES[name];
                    }

                    if (!isValid) {
                        divValue.style.color = '#d93025';
                        divValue.textContent += ` (Attendu: ${Array.isArray(REF_VALUES[name]) ? REF_VALUES[name].join(' ou ') : REF_VALUES[name]})`;
                        allMatch = false;
                    } else {
                        divValue.style.color = '#1e8e3e';
                    }
                }

                deviceInfoGrid.appendChild(divLabel);
                deviceInfoGrid.appendChild(divValue);

            } catch (e) {
                console.warn(`Failed to read ${name}`, e);
            }
        }

        deviceInfoCheck.style.display = 'block';
        if (allMatch) {
            deviceInfoCheck.textContent = 'Toutes les informations correspondent aux valeurs de référence.';
            deviceInfoCheck.className = 'status-message success';
        } else {
            deviceInfoCheck.textContent = "C'est intéressant : certaines valeurs diffèrent de la référence.";
            deviceInfoCheck.className = 'status-message error'; // Or warning style
        }

    } catch (e) {
        deviceInfoCheck.textContent = 'Impossible de lire le service Device Info : ' + e;
        deviceInfoCheck.className = 'status-message error';
        deviceInfoCheck.style.display = 'block';
    }
    return softwareVersion;
}

async function fetchExtraData(version) {
    extraDataGrid.innerHTML = '';
    
    // 1. Get Logs Count
    try {
        const packet = new Uint8Array([OP_GET_LOGS_COUNT]);
        await writeChar.writeValue(packet);
        // Response handled in handleNotifications
    } catch (e) {
        console.error("Error requesting logs count", e);
    }

    // 2. Get Code Count if version > 4.1.1
    if (compareVersions(version, '4.1.1') > 0) {
        try {
            // OP_COUNT_CODES is 0x14 (20)
            const packet = new Uint8Array([OP_COUNT_CODES]); // Using constant from ble-utils.js
            await writeChar.writeValue(packet);
            // Response handled in handleNotifications
        } catch (e) {
            console.error("Error requesting code count", e);
        }
    }
}

function compareVersions(v1, v2) {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

function showConditionalQuestions(version) {
    questionsContainer.innerHTML = '';
    let hasQuestions = false;

    // Question 1: Version < 4.3.3 -> "Avez-vous des boks tags ?"
    if (compareVersions(version, '4.3.3') < 0) {
        hasQuestions = true;
        addQuestion("Avez-vous des boks tags ?", "Non");
    }

    // Question 2: Version < 4.2.0 -> "Avez-vous activé les badges de la poste ?"
    if (compareVersions(version, '4.2.0') < 0) {
        hasQuestions = true;
        addQuestion("Avez-vous activé les badges de la poste ?", "Non");
    }

    if (hasQuestions) {
        conditionalQuestions.style.display = 'block';
    }
}

function addQuestion(text, expectedAnswer) {
    const div = document.createElement('div');
    div.style.marginBottom = '15px';
    div.style.padding = '10px';
    div.style.backgroundColor = '#f8f9fa';
    div.style.borderRadius = '4px';

    const p = document.createElement('p');
    p.textContent = text;
    p.style.fontWeight = 'bold';
    p.style.marginBottom = '10px';
    div.appendChild(p);

    const btnYes = document.createElement('button');
    btnYes.textContent = 'Oui';
    btnYes.style.marginRight = '10px';
    
    const btnNo = document.createElement('button');
    btnNo.textContent = 'Non';

    const resultDiv = document.createElement('div');
    resultDiv.style.marginTop = '5px';
    resultDiv.style.fontWeight = 'bold';

    const handleAnswer = (answer) => {
        btnYes.disabled = true;
        btnNo.disabled = true;
        
        collectedData.questionAnswers.push({
            question: text,
            answer: answer,
            expected: expectedAnswer
        });

        if (answer === expectedAnswer) {
            resultDiv.textContent = "OK";
            resultDiv.style.color = 'green';
        } else {
            resultDiv.textContent = "Attention : Cette configuration n'est pas recommandée pour votre version.";
            resultDiv.style.color = 'orange';
        }
    };

    btnYes.addEventListener('click', () => handleAnswer('Oui'));
    btnNo.addEventListener('click', () => handleAnswer('Non'));

    div.appendChild(btnYes);
    div.appendChild(btnNo);
    div.appendChild(resultDiv);
    questionsContainer.appendChild(div);
}

function addExtraDataDisplay(label, value) {
    // Check if already exists to avoid duplicates
    const existingLabels = Array.from(extraDataGrid.querySelectorAll('.info-label'));
    const existingLabel = existingLabels.find(el => el.textContent === label + ':');

    if (existingLabel) {
        const valueDiv = existingLabel.nextElementSibling;
        if (valueDiv) {
            valueDiv.textContent = value;
        }
        return;
    }

    const divLabel = document.createElement('div');
    divLabel.className = 'info-label';
    divLabel.textContent = label + ':';

    const divValue = document.createElement('div');
    divValue.textContent = value;

    extraDataGrid.appendChild(divLabel);
    extraDataGrid.appendChild(divValue);
}

// Step 2: Open/Close & Battery
openDoorBtn.addEventListener('click', async () => {
    const code = openCodeInput.value;
    if (!/^[0-9AB]{6}$/.test(code)) {
        alert('Format de code invalide. 6 caractères (0-9, A, B).');
        return;
    }

    doorStatus.style.display = 'block';
    doorStatus.textContent = 'Envoi de la commande d\'ouverture...';
    doorStatus.className = 'status-message';
    
    batteryStatus.style.display = 'block';
    batteryStatus.textContent = 'En attente de fermeture de la porte...';
    batteryStatus.className = 'status-message';
    batteryResult.style.display = 'none';

    isWaitingForClose = true; // Enable auto-battery read on close

    try {
        const packet = new Uint8Array(8);
        packet[0] = OP_OPEN_DOOR;
        packet[1] = 0x06;
        for (let i = 0; i < 6; i++) {
            packet[2 + i] = code.charCodeAt(i);
        }
        await writeChar.writeValue(packet);
    } catch (e) {
        doorStatus.textContent = 'Erreur d\'envoi : ' + e;
        doorStatus.className = 'status-message error';
        isWaitingForClose = false;
    }
});

function handleNotifications(event) {
    const value = new Uint8Array(event.target.value.buffer);
    const opcode = value[0];

    if (opcode === OP_ANSWER_DOOR_STATUS || opcode === OP_NOTIFY_DOOR_STATUS) {
        const isOpen = value[3] === 1;
        doorStatus.textContent = `Porte ${isOpen ? 'OUVERTE' : 'FERMÉE'}`;
        doorStatus.className = isOpen ? 'status-message success' : 'status-message';

        // Auto-read battery when door closes if we were waiting for it
        if (!isOpen && isWaitingForClose) {
            isWaitingForClose = false;
            batteryStatus.textContent = 'Lecture de la batterie en cours...';
            setTimeout(() => {
                readBattery();
            }, 500); // Small delay to ensure stable state
        }

    } else if (opcode === OP_VALID_OPEN_CODE) { // 0x81
         doorStatus.textContent = 'Code Valide ! Ouverture...';
         doorStatus.className = 'status-message success';
    } else if (opcode === OP_INVALID_OPEN_CODE) { // 0x82
         doorStatus.textContent = 'Code Invalide.';
         doorStatus.className = 'status-message error';
         isWaitingForClose = false;
    } else if (opcode === OP_NOTIFY_LOGS_COUNT) {
        const count = (value[2] << 8) | value[3];
        addExtraDataDisplay('Nombre de Logs', count);
        collectedData.extraData.logsCount = count;
    } else if (opcode === OP_NOTIFY_CODES_COUNT) {
        const masterCount = (value[2] << 8) | value[3];
        const singleCount = (value[4] << 8) | value[5];
        
        let display = `Master: ${masterCount}, Single-Use: ${singleCount}`;
        collectedData.extraData.codes = { master: masterCount, single: singleCount };

        if (value.length >= 8) {
             const multiCount = (value[6] << 8) | value[7];
             display += `, Multi-Use: ${multiCount}`;
             collectedData.extraData.codes.multi = multiCount;
        }
        addExtraDataDisplay('Nombre de Codes', display);
    }
}

async function readBattery() {
    batteryResult.style.display = 'block';
    batteryResult.textContent = 'Lecture en cours...';

    try {
        const services = await server.getPrimaryServices();
        let found = false;
        
        for (const s of services) {
            try {
                const char = await s.getCharacteristic('00000004-0000-1000-8000-00805f9b34fb');
                const value = await char.readValue();
                const hex = Array.from(new Uint8Array(value.buffer))
                    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                    .join(' ');
                
                batteryResult.textContent = `Service: ${s.uuid}\nUUID: ${char.uuid}\nValeur Hex: ${hex}`;
                
                collectedData.batteryData.rawHex = hex;
                collectedData.batteryData.serviceUuid = s.uuid;

                // Parse if it matches expected length (6 bytes)
                if (value.byteLength === 6) {
                    const v = new Uint8Array(value.buffer);
                    const first = v[0] * 100;
                    const min = v[1] * 100;
                    const mean = v[2] * 100;
                    const max = v[3] * 100;
                    const last = v[4] * 100;
                    const temp = v[5] - 25;
                    
                    batteryResult.textContent += `\n\nInterprétation:\nFirst: ${first}mV\nMin: ${min}mV\nMean: ${mean}mV\nMax: ${max}mV\nLast: ${last}mV\nTemp: ${temp}°C`;
                    
                    collectedData.batteryData.parsed = {
                        first_mV: first,
                        min_mV: min,
                        mean_mV: mean,
                        max_mV: max,
                        last_mV: last,
                        temp_C: temp
                    };
                }
                
                found = true;
                break;
            } catch (e) {
                // Not in this service
            }
        }
        
        if (!found) {
            batteryResult.textContent = 'Caractéristique 00000004... non trouvée dans les services exposés.';
            collectedData.batteryData.error = 'Characteristic not found';
        }

        batteryStatus.textContent = 'Lecture terminée';
        batteryStatus.className = 'status-message success';

    } catch (e) {
        batteryResult.textContent = 'Erreur de lecture : ' + e;
        collectedData.batteryData.error = e.toString();

        batteryStatus.textContent = 'Erreur lors de la lecture de la batterie';
        batteryStatus.className = 'status-message error';
    }
}

function generateRecap() {
    jsonRecap.value = JSON.stringify(collectedData, null, 2);
}

// Step 3: Advanced Debug
exploreServiceBtn.addEventListener('click', async () => {
    const uuid = customServiceUuidInput.value;
    if (!uuid) return;

    serviceExplorationLog.textContent = `Exploration du service ${uuid}...\n`;

    try {
        const service = await server.getPrimaryService(uuid);
        const characteristics = await service.getCharacteristics();

        for (const char of characteristics) {
            serviceExplorationLog.textContent += `\nChar: ${char.uuid}`;
            
            // Try to read
            if (char.properties.read) {
                try {
                    const value = await char.readValue();
                    const hex = Array.from(new Uint8Array(value.buffer))
                        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                        .join(' ');
                    serviceExplorationLog.textContent += `\n  Value (Hex): ${hex}`;
                    
                    // Try text decode
                    try {
                        const text = new TextDecoder('utf-8').decode(value);
                        // Only show if it looks like printable text
                        if (/^[\x20-\x7E]*$/.test(text)) {
                             serviceExplorationLog.textContent += `\n  Value (Text): ${text}`;
                        }
                    } catch (e) {}

                } catch (e) {
                    serviceExplorationLog.textContent += `\n  Read Error: ${e.message}`;
                }
            } else {
                serviceExplorationLog.textContent += `\n  (Not Readable)`;
            }
        }

    } catch (e) {
        serviceExplorationLog.textContent += `\nErreur : ${e.message}`;
    }
});