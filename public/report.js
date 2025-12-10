// Get DOM elements
const jsonInput = document.getElementById('jsonInput');
const generateBtn = document.getElementById('generateBtn');
const reportContainer = document.getElementById('reportContainer');
const deviceInfoGrid = document.getElementById('deviceInfoGrid');
const userInputsGrid = document.getElementById('userInputsGrid');
const extraDataGrid = document.getElementById('extraDataGrid');
const batteryInfoGrid = document.getElementById('batteryInfoGrid');
const proprietaryBatteryData = document.getElementById('proprietaryBatteryData');
const batteryWarnings = document.getElementById('batteryWarnings');
const qaContainer = document.getElementById('qaContainer');

// Add event listener to the generate button
generateBtn.addEventListener('click', generateReport);

function generateReport() {
    try {
        // Parse JSON input
        const jsonData = JSON.parse(jsonInput.value);
        
        // Display the report sections
        displayDeviceInfo(jsonData.deviceInfo);
        displayUserInputs(jsonData.userInputs);
        displayExtraData(jsonData.extraData);
        displayBatteryStatus(jsonData.batteryData);
        displayQuestionAnswers(jsonData.questionAnswers);
        
        // Show the report container
        reportContainer.style.display = 'block';
    } catch (error) {
        alert('Erreur lors de l\'analyse du JSON : ' + error.message);
    }
}

function displayDeviceInfo(deviceInfo) {
    deviceInfoGrid.innerHTML = '';
    
    if (!deviceInfo) {
        deviceInfoGrid.innerHTML = '<div>Aucune information disponible</div>';
        return;
    }
    
    // Add each device info field
    addInfoToGrid(deviceInfoGrid, 'Modèle', deviceInfo['Model Number'] || 'N/A');
    addInfoToGrid(deviceInfoGrid, 'Firmware', deviceInfo['Firmware Revision'] || 'N/A');
    addInfoToGrid(deviceInfoGrid, 'Software', deviceInfo['Software Revision'] || 'N/A');
    addInfoToGrid(deviceInfoGrid, 'Fabricant', deviceInfo['Manufacturer Name'] || 'N/A');
}

function displayUserInputs(userInputs) {
    userInputsGrid.innerHTML = '';
    
    if (!userInputs) {
        userInputsGrid.innerHTML = '<div>Aucune information disponible</div>';
        return;
    }
    
    // Add user inputs
    addInfoToGrid(userInputsGrid, 'Type de Boks', userInputs.boksType || 'N/A');
    
    // Display scale information
    let scaleText = 'Non défini';
    if (userInputs.hasScale === 'yes') scaleText = 'Oui';
    else if (userInputs.hasScale === 'no') scaleText = 'Non';
    else if (userInputs.hasScale === 'unknown') scaleText = 'Je ne sais pas';
    else if (typeof userInputs.hasScale === 'boolean') scaleText = userInputs.hasScale ? 'Oui' : 'Non'; // Backwards compatibility
    
    addInfoToGrid(userInputsGrid, 'Balance', scaleText);
}

function displayExtraData(extraData) {
    extraDataGrid.innerHTML = '';
    
    if (!extraData) {
        extraDataGrid.innerHTML = '<div>Aucune donnée supplémentaire disponible</div>';
        return;
    }
    
    // Display logs count
    if (extraData.logsCount !== undefined) {
        addInfoToGrid(extraDataGrid, 'Nombre de Logs', extraData.logsCount);
    }
    
    // Display codes information
    if (extraData.codes) {
        let codesText = '';
        if (extraData.codes.master !== undefined) {
            codesText += `Master: ${extraData.codes.master}`;
        }
        if (extraData.codes.single !== undefined) {
            codesText += `, Usage unique: ${extraData.codes.single}`;
        }
        if (extraData.codes.multi !== undefined) {
            codesText += `, Usage multiple: ${extraData.codes.multi}`;
        }
        addInfoToGrid(extraDataGrid, 'Codes', codesText);
    }
}

function displayBatteryStatus(batteryData) {
    batteryInfoGrid.innerHTML = '';
    proprietaryBatteryData.innerHTML = '';
    batteryWarnings.innerHTML = '';
    
    if (!batteryData) {
        batteryInfoGrid.innerHTML = '<div>Aucune information sur la batterie disponible</div>';
        return;
    }
    
    // Display standard battery level
    if (batteryData.standardLevel !== undefined) {
        addInfoToGrid(batteryInfoGrid, 'Pourcentage Standard', `${batteryData.standardLevel}%`);
    } else if (batteryData.standardError) {
        addInfoToGrid(batteryInfoGrid, 'Erreur Standard', batteryData.standardError, 'error');
    }
    
    // Display voltage if available
    if (batteryData.parsed && batteryData.parsed.last_mV !== undefined) {
        const voltage = (batteryData.parsed.last_mV / 1000).toFixed(2);
        addInfoToGrid(batteryInfoGrid, 'Tension', `${voltage} V`);
    }
    
    // Display temperature if available
    if (batteryData.parsed && batteryData.parsed.temp_C !== undefined) {
        addInfoToGrid(batteryInfoGrid, 'Température', `${batteryData.parsed.temp_C}°C`);
    }
    
    // Display proprietary data
    if (batteryData.rawHex) {
        const proprietaryInfo = document.createElement('div');
        proprietaryInfo.innerHTML = `
            <div><strong>Données Brutes (Hex):</strong> ${batteryData.rawHex}</div>
            <div><strong>Service UUID:</strong> ${batteryData.serviceUuid || 'N/A'}</div>
        `;
        proprietaryBatteryData.appendChild(proprietaryInfo);
    }
    
    // Display parsed data based on format
    if (batteryData.parsed) {
        const format = batteryData.parsed.format;
        const parsedInfo = document.createElement('div');
        parsedInfo.className = 'log-container';
        parsedInfo.style.height = 'auto';
        parsedInfo.style.maxHeight = '200px';
        
        let parsedText = `Format: ${format}\n`;
        
        if (format === "Single Measure" && batteryData.parsed.level !== undefined) {
            parsedText += `Niveau: ${batteryData.parsed.level}%`;
        } else if (format === "T1/T5/T10") {
            parsedText += `Niveau: ${batteryData.parsed.level}%\n`;
            parsedText += `T1: ${batteryData.parsed.t1}\n`;
            parsedText += `T5: ${batteryData.parsed.t5}\n`;
            parsedText += `Température: ${batteryData.parsed.temp_C}°C`;
        } else if (format === "Min/Mean/Max") {
            parsedText += `Premier: ${batteryData.parsed.first_mV} mV\n`;
            parsedText += `Min: ${batteryData.parsed.min_mV} mV\n`;
            parsedText += `Moyen: ${batteryData.parsed.mean_mV} mV\n`;
            parsedText += `Max: ${batteryData.parsed.max_mV} mV\n`;
            parsedText += `Dernier: ${batteryData.parsed.last_mV} mV\n`;
            if (batteryData.parsed.estimatedPercentage !== undefined) {
                parsedText += `Estimation (8x AAA): ${batteryData.parsed.estimatedPercentage}%\n`;
            }
            parsedText += `Température: ${batteryData.parsed.temp_C}°C`;
        }
        
        parsedInfo.textContent = parsedText;
        proprietaryBatteryData.appendChild(parsedInfo);
    }
    
    // Display warnings and analysis
    if (batteryData.parsed) {
        let voltage = undefined;
        if (batteryData.parsed.last_mV !== undefined) voltage = batteryData.parsed.last_mV;
        else if (batteryData.parsed.min_mV !== undefined) voltage = batteryData.parsed.min_mV;
        
        // Only proceed if we have a valid voltage
        if (voltage !== undefined && voltage > 0) {
            
            const batteryType = batteryData.parsed.batteryType || ((voltage > 5000) ? 'aaa' : 'lsh14');
            const typeSource = batteryData.parsed.typeSource || "Détecté (auto)";
            const displayType = (batteryType === 'aaa') ? '8x AAA' : 'LSH14';
            const consistency = batteryData.parsed.consistency; // 'success', 'error', 'warning', 'neutral'

            // Info about type
            const typeInfo = document.createElement('div');
            let consistencyIcon = '';
            if (consistency === 'success') consistencyIcon = '✅';
            else if (consistency === 'error') consistencyIcon = '❌';
            else if (consistency === 'warning') consistencyIcon = '⚠️';
            else if (consistency === 'neutral') consistencyIcon = 'ℹ️';

            typeInfo.innerHTML = `<strong>Type :</strong> ${displayType} <br>
                                  <span style="font-size:0.9em; color:#666;">Source: ${typeSource} ${consistencyIcon}</span>`;
            
            typeInfo.style.marginBottom = '10px';
            typeInfo.style.padding = '5px';
            typeInfo.style.borderLeft = '3px solid #ccc';
            if (consistency === 'success') typeInfo.style.borderLeftColor = 'green';
            else if (consistency === 'error') typeInfo.style.borderLeftColor = '#d93025';
            else if (consistency === 'warning') typeInfo.style.borderLeftColor = '#ff9800';

            batteryWarnings.appendChild(typeInfo);

            let alertLevel = 'OK';
            let msg = '';
            let color = '';
            let bgColor = '';
            let borderColor = '';

            if (batteryType === 'aaa') {
                if (voltage < 7200) {
                    alertLevel = 'CRITICAL';
                    msg = `<strong>EMPTY (${voltage}mV):</strong> Electronics failing. Replace 8x AAA immediately.`;
                    color = '#b71c1c'; bgColor = '#ffebee'; borderColor = '#b71c1c';
                } else if (voltage < 8000) {
                    alertLevel = 'ALARM';
                    msg = `CRITICAL (${voltage}mV): Shutdown imminent. Leakage risk. Replace 8x AAA.`;
                    color = '#c62828'; bgColor = '#ffebee'; borderColor = '#ef5350';
                } else if (voltage < 9600) {
                    alertLevel = 'LOW';
                    msg = `LOW (${voltage}mV): ~20-30% remaining. Plan replacement.`;
                    color = '#e65100'; bgColor = '#fff3e0'; borderColor = '#ffb74d';
                }
            } else {
                // LSH14
                if (voltage < 3000) {
                    alertLevel = 'CRITICAL';
                    msg = `<strong>EMPTY (${voltage}mV):</strong> Battery empty. Rapid drop to 0V imminent. Replace LSH14.`;
                    color = '#b71c1c'; bgColor = '#ffebee'; borderColor = '#b71c1c';
                } else if (voltage <= 3300) {
                    alertLevel = 'ALARM';
                    msg = `URGENT (${voltage}mV): Leaving stable plateau (< 5% left). Replace LSH14 immediately.`;
                    color = '#c62828'; bgColor = '#ffebee'; borderColor = '#ef5350';
                } 
            }

            if (alertLevel !== 'OK') {
                const alertDiv = document.createElement('div');
                alertDiv.style.padding = '10px';
                alertDiv.style.borderRadius = '4px';
                alertDiv.style.marginTop = '5px';
                alertDiv.style.backgroundColor = bgColor;
                alertDiv.style.border = `1px solid ${borderColor}`;
                alertDiv.style.color = color;
                alertDiv.innerHTML = msg;
                batteryWarnings.appendChild(alertDiv);
            } else {
                const okDiv = document.createElement('div');
                okDiv.className = 'success';
                okDiv.textContent = `Batterie OK (${voltage} mV)`;
                batteryWarnings.appendChild(okDiv);
            }
        }
    }
}

function displayQuestionAnswers(questionAnswers) {
    qaContainer.innerHTML = '';
    
    if (!questionAnswers || questionAnswers.length === 0) {
        qaContainer.innerHTML = '<div>Aucune réponse aux questions disponible</div>';
        return;
    }
    
    // Display each Q&A pair
    questionAnswers.forEach(qa => {
        const qaDiv = document.createElement('div');
        qaDiv.className = 'qa-pair';
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'qa-question';
        questionDiv.textContent = qa.question;
        
        const answerDiv = document.createElement('div');
        answerDiv.className = 'qa-answer';
        answerDiv.textContent = `Réponse: ${qa.answer}`;
        
        let expectedDiv = null;
        if (qa.expected) {
            expectedDiv = document.createElement('div');
            expectedDiv.textContent = `Attendu: ${qa.expected}`;
            
            // Highlight if answer doesn't match expected
            if (qa.answer !== qa.expected) {
                expectedDiv.className = 'warning';
            }
        }
        
        qaDiv.appendChild(questionDiv);
        qaDiv.appendChild(answerDiv);
        if (expectedDiv) {
            qaDiv.appendChild(expectedDiv);
        }
        
        qaContainer.appendChild(qaDiv);
    });
}

function addInfoToGrid(grid, label, value, className = '') {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'info-label';
    labelDiv.textContent = label + ':';
    
    const valueDiv = document.createElement('div');
    valueDiv.textContent = value;
    
    if (className) {
        valueDiv.className = className;
    }
    
    grid.appendChild(labelDiv);
    grid.appendChild(valueDiv);
}