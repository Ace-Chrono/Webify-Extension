let presetItems = null;

export function initPresets(presetElement) {
    presetItems = presetElement;
    updatePresetList();
}

export function updatePresetList() {
    chrome.storage.local.get('userPresets', function(data) {
        presetItems.innerHTML = '';
        if (data.userPresets && data.userPresets.length > 0) {
            data.userPresets.forEach((preset, index) => {
                const li = document.createElement('li');
                li.classList.add('preset');

                const presetContainer = document.createElement('div');
                presetContainer.classList.add('presetContainer');

                const presetText = document.createElement('span');
                presetText.textContent = preset.presetName;
                presetText.classList.add('presetText');
                presetContainer.appendChild(presetText);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('deleteButton');
                deleteButton.addEventListener('click', function () {
                    removePreset(index);
                });
                presetContainer.appendChild(deleteButton);

                const switchLabel = document.createElement('label');
                const switchInput = document.createElement('input');
                switchInput.type = 'checkBox';
                switchInput.classList.add('onOffSwitch');
                switchInput.checked = preset.isActive || false; 
                switchInput.addEventListener('change', function() {
                    togglePresetStatus(index, switchInput.checked);
                });
                switchLabel.appendChild(switchInput);
                presetContainer.appendChild(switchLabel);

                li.appendChild(presetContainer);
                presetItems.appendChild(li);
            });
        } else {
            presetItems.innerHTML = '<li>No presets available</li>';
        }
    });
}

function removePreset(index) {
    chrome.storage.local.get('userPresets', function(data) {
        if (data.userPresets) {
            data.userPresets.splice(index, 1);
            chrome.storage.local.set({ userPresets: data.userPresets }, function() {
                updatePresetList();
        });
        }
    });
}

function togglePresetStatus (index, isActive) {
    chrome.storage.local.get('userPresets', function(data) {
        data.userPresets[index].isActive = isActive; 
        chrome.storage.local.set({ userPresets: data.userPresets }, function() {
            console.log(`Preset ${index + 1} is now ${isActive ? 'active' : 'inactive'}`);
        });
    })
}