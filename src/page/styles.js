import { extractColorsCategorized } from "./siteMods/colorUtils";
import { handlePresetsUpdate, getPresets } from "./siteMods/presets";
import { globalState, uiState } from "./siteMods/state";
import { handleUserChanges } from "./siteMods/listeners.js";

let categorizedColors = null; 
let backgroundColors = null; 
let currentUrl = window.location.href; 

window.onload = function () {
    function waitForMostlyLoaded(timeout = 2000, checkInterval = 100) {
        return new Promise((resolve) => {
            let lastElementCount = document.body.getElementsByTagName('*').length;
            let stableTime = 0;

            const observer = new MutationObserver(() => {
                const currentCount = document.body.getElementsByTagName('*').length;
                if (currentCount === lastElementCount) {
                    stableTime += checkInterval;
                } else {
                    stableTime = 0;
                    lastElementCount = currentCount;
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            const intervalId = setInterval(() => {
                if (stableTime >= 250 || performance.now() > timeout) {
                    clearInterval(intervalId);
                    observer.disconnect();
                    resolve();
                }
            }, checkInterval);
        });
    }

    async function initializeExtension() {
        await waitForMostlyLoaded();
        globalState.setCurrentOrigin(window.location.origin);
        categorizedColors = extractColorsCategorized();
        backgroundColors = [...categorizedColors.background.slice(0, 3)].sort();
        globalState.setInitialCategorizedColors(categorizedColors);
        globalState.setInitialBackgroundColors(backgroundColors);
        uiState.setBackgroundColors(globalState.getInitialBackgroundColors());
        handleUserChanges();
        handlePresetsUpdate();
        getPresets();
    }

    function checkUrlChange() {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            initializeExtension();
        }
    }

    initializeExtension();
    setInterval(checkUrlChange, 1000); 
    window.addEventListener("popstate", checkUrlChange); 
};
