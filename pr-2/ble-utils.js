// BLE Constants
const SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
const WRITE_CHAR_UUID = 'a7630002-f491-4f21-95ea-846ba586e361';
const NOTIFY_CHAR_UUID = 'a7630003-f491-4f21-95ea-846ba586e361';
const CUSTOM_BATTERY_CHAR_UUID = '00000004-0000-1000-8000-00805f9b34fb';

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
const OP_DELETE_MASTER_CODE = 0x0C;
const OP_DELETE_SINGLE_CODE = 0x0D;
const OP_DELETE_MULTI_CODE = 0x0E;
const OP_CREATE_MASTER = 0x11;
const OP_CREATE_SINGLE = 0x12;
const OP_CREATE_MULTI = 0x13;
const OP_COUNT_CODES = 0x14;
const OP_NOTIFY_LOGS_COUNT = 0x79;
const OP_NOTIFY_DOOR_STATUS = 0x84;
const OP_ANSWER_DOOR_STATUS = 0x85;
const OP_END_HISTORY = 0x92;
const OP_NOTIFY_CODES_COUNT = 0xC3;
const OP_NOTIFY_SET_CONFIGURATION_SUCCESS = 0xC4;
const OP_VALID_OPEN_CODE = 0x81;
const OP_INVALID_OPEN_CODE = 0x82;

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
        if ((opcode >= 0x86 && opcode <= 0xA2) && data.length >= 5) {
             const age = (data[2] << 16) | (data[3] << 8) | data[4];
             let extra = '';

             // Specific Parsers based on Opcode
             if (opcode === 0x86 || opcode === 0x88) { // CODE_BLE_VALID / INVALID
                 if (data.length >= 11) {
                     const codeBytes = data.slice(5, 11);
                     const codeStr = new TextDecoder().decode(codeBytes);
                     extra = `, Code="${codeStr}"`;
                 }
             } else if (opcode === 0x87 || opcode === 0x89) { // CODE_KEY_VALID / INVALID
                 if (data.length >= 11) {
                     const codeBytes = data.slice(5, 11);
                     const codeStr = new TextDecoder().decode(codeBytes);
                     extra = `, Code="${codeStr}"`;
                 }
             } else if (opcode === 0x94) { // POWER_OFF
                 if (data.length >= 6) {
                     const reasonMap = {1:'PIN_RESET', 2:'WATCHDOG', 3:'SOFT_RESET', 4:'LOCKUP', 5:'GPIO', 6:'LPCOMP', 7:'DEBUG', 8:'NFC'};
                     extra = `, Reason=${reasonMap[data[5]] || data[5]}`;
                 }
             } else if (opcode === 0xA0) { // ERROR
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

/**
 * Checks if Web Bluetooth API is available and provides a user-friendly message.
 * @returns {object} { isAvailable: boolean, message: string, recommendBluefy: boolean }
 */
function checkWebBluetoothAvailability() {
    // Detect iOS (iPad, iPhone, iPod) and exclude desktop Safari which supports Web Bluetooth.
    // The WebKit restriction for Web Bluetooth is specific to iOS/iPadOS browsers.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && (navigator.maxTouchPoints > 0 || 'ontouchstart' in document);

    if (!navigator.bluetooth) {
        if (isIOS) {
            return {
                isAvailable: false,
                message: "L'API Web Bluetooth n'est pas disponible sur ce navigateur iOS. Pour accéder aux fonctionnalités Bluetooth, veuillez utiliser l'application **Bluefy** (disponible sur l'App Store) et ouvrir cette page dans Bluefy.",
                recommendBluefy: true
            };
        } else {
            return {
                isAvailable: false,
                message: "L'API Web Bluetooth n'est pas disponible sur ce navigateur. Assurez-vous d'utiliser un navigateur compatible (ex: Chrome sur Android/Desktop, Edge) et que le Bluetooth est activé sur votre appareil.",
                recommendBluefy: false
            };
        }
    }
    return { isAvailable: true, message: "Web Bluetooth est disponible.", recommendBluefy: false };
}


/**
 * Infers PCB Version and Battery Type from Firmware Revision String
 * @param {string} firmwareRevision 
 * @returns {object} { version: string, battery: 'aaa'|'lsh14'|'unknown', label: string }
 */
function inferHardwareFromFirmware(firmwareRevision) {
    if (!firmwareRevision) return { version: 'Unknown', battery: 'unknown', label: 'Inconnu' };
    
    // Normalize string to handle potential encoding weirdness or case
    const rev = firmwareRevision.toLowerCase();

    if (rev.includes('10/125')) {
        return { version: '4.0', battery: 'aaa', label: '8x AAA' };
    }
    if (rev.includes('10/cd')) {
        return { version: '3.0', battery: 'lsh14', label: 'Saft LSH14' };
    }

    return { version: 'Unknown', battery: 'unknown', label: 'Inconnu' };
}
