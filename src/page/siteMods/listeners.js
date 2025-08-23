import { darkenColor, invertColor } from "./colorUtils";
import { changeBackgroundColor, changeFont, changeAdvancedSettings, changeSize, changeCase, injectCSS, } from "./settings";
import { resetPreset, addPreset, createPreset } from "./presets";
import { uiState, zapState } from "./state";
import { zap } from "./zapMode";

let newUserBackgroundColors = null;
let loadedData = null;

chrome.runtime.onMessage.addListener(function(message) { //Checks for any edits to the page made by the user and applies them
    /*if (message.action === 'storeTabId') { //Gets the Id of the current tab and stores it in the local chrome storage
        chrome.storage.local.set({ activeTabId: sender.tab.id });
    }*/
    if (message.action === 'changeColor') { //Changes the background color of the tab
        newUserBackgroundColors = [
            darkenColor(message.color, 40), 
            darkenColor(message.color, 20), 
            darkenColor(message.color, 0)
        ];
        changeBackgroundColor(newUserBackgroundColors);
    }
    if (message.action === 'invertColor') { //Inverts the brightness of the background color of the tab
        const currentColors = uiState.getBackgroundColors();
        newUserBackgroundColors = [
            invertColor(currentColors[0]),
            invertColor(currentColors[1]),
            invertColor(currentColors[2])
        ];
        changeBackgroundColor(newUserBackgroundColors);
    }
    if (message.action === 'reset') { //Resets and color changes made by the user
        resetPreset();
    }
    if (message.action === 'changeFont') { //Changes the font of all the text in the tab
        changeFont(message.font);
    }
    if (message.action === 'changeContrast') { //Changes the contrast of the tab
        changeAdvancedSettings(
            message.amount, 
            uiState.getBrightness(),
            uiState.getSaturation()
        );
        uiState.setContrast(message.amount);
    }
    if (message.action === 'changeBrightness') { //Changes the brightness of the tab
        changeAdvancedSettings(
            uiState.getContrast(),
            message.amount,
            uiState.getSaturation()
        );
        uiState.setBrightness(message.amount);
    }
    if (message.action === 'changeSaturation') { //Changes the saturation of the tab
        changeAdvancedSettings(
            uiState.getContrast(),
            uiState.getBrightness(),
            message.amount
        );
        uiState.setSaturation(message.amount);
    }
    if (message.action === 'changeSize') { //Changes how zoomed in the document is
        changeSize(uiState.getZoomedIn());
    }
    if (message.action === 'changeCase') { //Changes the case of all the text in the tab
        changeCase(uiState.getTextCase(), true);
    }
    if (message.action === 'zap') { //Allows the user to enable zap mode to remove elements from the tab
        zap();
    }
    if (message.action === "injectCSS") { //Injects any css code written by the user into the tab
        if (message.css) {
            injectCSS(message.css);
        }
    }
    if (message.action === 'share') { //Saves changes by the user to create a website profile
        const presetName = "test";
        const websiteURL = window.location.origin;
        const isActive = true; 
        const settings = {
            presetName,
            websiteURL,
            isActive,
            backgroundColors: uiState.getBackgroundColors(),
            contrast: uiState.getContrast(),
            brightness: uiState.getBrightness(),
            saturation: uiState.getSaturation(),
            font: uiState.getFont(),
            zoomedIn: uiState.getZoomedIn(),
            textCase: uiState.getTextCase(),
            zappedElementsID: zapState.getIDs(),
            cssChanges: uiState.getCSSChanges()
        }
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = 'settings.json';
        link.click();
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
});

//____________________________________________________________________________________________________