import { extractColorsCategorized } from "./siteMods/colorUtils";
import { handlePresetsUpdate, getPresets, createPreset, applyPreset } from "./siteMods/presets";
import { globalState, uiState } from "./siteMods/state";
import "./siteMods/listeners.js";
import { handleUserChanges } from "./siteMods/listeners.js";

let currentCategorizedColors = null; 
let currentBackgroundColors = null; 
let newCategorizedColors = null;
let newBackgroundColors = null;
let currentUrl = null; 
let noChangeTimer = null;
let initialRunCompleted = false;

window.onload = function () {
    globalState.setCurrentOrigin(window.location.origin);
    currentCategorizedColors = extractColorsCategorized();
    currentBackgroundColors = [...currentCategorizedColors.background.slice(0, 3)].sort();
    currentUrl = window.location.href; 
    resetNoChangeTimer();
    startObserver();
    setTimeout(() => observer.disconnect(), 30000);
    
    function startObserver() {
        if (observer) observer.disconnect(); // Ensure the previous observer is removed
        observer.observe(document.body, { childList: true, subtree: true });
    }

    let observer = new MutationObserver(() => { 
        newCategorizedColors = extractColorsCategorized();
        newBackgroundColors = [...newCategorizedColors.background.slice(0, 3)].sort();
        if (JSON.stringify(currentBackgroundColors) !== JSON.stringify(newBackgroundColors)) {
            currentCategorizedColors = newCategorizedColors;
            currentBackgroundColors = newBackgroundColors;
            resetNoChangeTimer();
        }
    });

    function resetNoChangeTimer() {
        if (noChangeTimer) {
            clearTimeout(noChangeTimer);
        }
        if (!initialRunCompleted) {
            // Initial 1.5-second delay
            noChangeTimer = setTimeout(() => {
                globalState.setInitialBackgroundColors(currentBackgroundColors);
                globalState.setInitialCategorizedColors(currentCategorizedColors);
                uiState.setBackgroundColors(globalState.getInitialBackgroundColors());
                handleUserChanges();
                handlePresetsUpdate();
                getPresets();
                observer.disconnect();
                initialRunCompleted = true;
            }, 1500);
        }
    }

    setInterval(checkUrlChange, 1000); 
    window.addEventListener("popstate", checkUrlChange); 

    function checkUrlChange() { // Detects URL changes in SPAs and restart the observer
        if (window.location.href !== currentUrl) {
            const currentChanges = createPreset("Temporary");
            currentUrl = window.location.href;
            applyPreset(currentChanges);
            //startObserver(); 
        }
    }
};