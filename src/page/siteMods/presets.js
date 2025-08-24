import { globalState, presetState, textElementsState, uiState, zapState } from "./state";
import { changeBackgroundColor, changeFont, changeAdvancedSettings, changeSize, changeCase, injectCSS } from "./settings";

export function handlePresetsUpdate() {
    chrome.storage.onChanged.
    Listener((changes, areaName) => {
        if (areaName === 'local' && changes.userPresets) {
            getPresets();
        }
    });
}

export function getPresets() {
    chrome.storage.local.get('userPresets', (data) => {
        presetState.setPresets(data.userPresets || []);
        const presetMap = {};
        presetState.setPresetData(null);

        presetState.getPresets().forEach(preset => {
            presetMap[preset.websiteURL] = preset;
        });
        presetState.setPresetMap(presetMap);

        const currentOrigin = globalState.getCurrentOrigin();
        const currentPreset = presetMap[currentOrigin];
        presetState.setPresetData(currentPreset);

        if (presetState.getPresetData()) {
            applyPreset(presetState.getPresetData());
        }
    });
}

export function applyPreset(presetData) {
    if (presetState.isApplied()) {
        resetPreset();
        presetState.setApplied(false);
    }
    if (presetData.websiteURL == window.location.origin && presetData.isActive) {
        const initialCategorizedColors = globalState.getInitialCategorizedColors(); 
        if (initialCategorizedColors) {
            changeBackgroundColor(presetData.backgroundColors);
        }
        uiState.setBackgroundColors(presetData.backgroundColors);

        changeAdvancedSettings(presetData.contrast, presetData.brightness, presetData.saturation);
        changeFont(presetData.font);
        changeSize(!presetData.zoomedIn);
        changeCase(presetData.case, false);
        injectCSS(presetData.CSSChanges);

        for (let i = 0; i < presetData.zappedElementsID.length; i++) {
            const identifier = presetData.zappedElementsID[i];
            if (identifier.startsWith('ID: ')) {
                const id = identifier.replace('ID: ', '');
                const el = document.getElementById(id);
                zapState.addElement({
                    element: el,
                    displayStyle: el.style.display
                });
                el.style.display = 'none'
            }
        }

        presetState.setApplied(true);
    }
}

export function resetPreset() {
    const styleElement = document.getElementById('injectedCSS');
    if (styleElement) {
        styleElement.remove();
    }

    const initialBackgroundColors = globalState.getInitialBackgroundColors(); 
    changeBackgroundColor(initialBackgroundColors);
    changeAdvancedSettings(100,100,100);
    changeFont(null);
    changeSize(true);

    const elementsWithText = textElementsState.getTextElements(); 

    if (uiState.getTextCase() !== 'normal') {
        for (let i = 0; i < elementsWithText.length; i++) {
            elementsWithText[i].style.textTransform = 'none';
        }
        textElementsState.setTextElements(elementsWithText);
        uiState.setTextCase('normal')
    }

    const zappedElements = zapState.getElements();

    for (let i = 0; i < zappedElements.length; i++) {
        zappedElements[i].element.style.display = zappedElements[i].displayStyle;
    }

    zapState.setElements(zappedElements);
}

export function createPreset(presetName) {
    const websiteURL = window.location.origin;
    const isActive = true; 
    const newPreset = {
        presetName,
        websiteURL,
        isActive,
        backgroundColors: uiState.getBackgroundColors(),
        contrast: uiState.getContrast(),
        brightness: uiState.getBrightness(),
        saturation: uiState.getSaturation(),
        font: uiState.getFont(),
        zoomedIn: uiState.getZoomedIn(),
        case: uiState.getTextCase(),
        zappedElementsID: zapState.getIDs(),
        CSSChanges: uiState.getCSSChanges()
    }

    return newPreset; 
}

export function addPreset(newPreset) {
    presetState.addPreset(newPreset);
    const updatedPresets = presetState.getPresets();
    chrome.storage.local.set({ userPresets: updatedPresets }, () => {
        console.log('Preset added successfully!');
    });
}