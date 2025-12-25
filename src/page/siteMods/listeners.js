import { changeColor, invertColor } from "./colorUtilsHelpers/colorApplication";
import { changeFont, changeAdvancedSettings, changeSize, changeCase, injectCSS, } from "./settings";
import { addPreset, createPreset, resetPreset } from "./presets";
import { uiState } from "./state";
import { zap } from "./zapMode";

let loadedData = null;

export function handleUserChanges() {
    chrome.runtime.onMessage.addListener(async function(message) {
        if (message.action === 'changeColor') {
            changeColor(message.color); 
        }
        if (message.action === 'invertColor') {
            invertColor();
        }
        if (message.action === 'reset') {
            resetPreset();
        }
        if (message.action === 'changeFont') {
            changeFont(message.font);
        }
        if (message.action === 'changeContrast') {
            changeAdvancedSettings(
                message.amount, 
                uiState.getBrightness(),
                uiState.getSaturation()
            );
            uiState.setContrast(message.amount);
        }
        if (message.action === 'changeBrightness') {
            changeAdvancedSettings(
                uiState.getContrast(),
                message.amount,
                uiState.getSaturation()
            );
            uiState.setBrightness(message.amount);
        }
        if (message.action === 'changeSaturation') {
            changeAdvancedSettings(
                uiState.getContrast(),
                uiState.getBrightness(),
                message.amount
            );
            uiState.setSaturation(message.amount);
        }
        if (message.action === 'changeSize') {
            changeSize(uiState.getZoomedIn());
        }
        if (message.action === 'changeCase') {
            changeCase(uiState.getTextCase(), true);
        }
        if (message.action === 'zap') {
            zap();
        }
        if (message.action === "injectCSS") {
            if (message.css) {
                injectCSS(message.css);
            }
        }
        if (message.action === 'sync') {
            const presets = message.data; 
            presets.forEach(preset => {
                addPreset(preset);
            });
        }
        if (message.action === 'load') {
            loadedData = message.data; 
            addPreset(loadedData);
        }
        if (message.action === 'save') {
            const presetName = message.name;
            const newPreset = createPreset(presetName);
            addPreset(newPreset);
        }
        if (message.action === 'clear') {
            chrome.storage.local.remove('userPresets', () => {
                console.log('User presets removed!');
            });
        }
        if (message.action === 'download') {
            const blob = new Blob([JSON.stringify(message.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = 'settings.json';
            link.click();
        }
    });
}