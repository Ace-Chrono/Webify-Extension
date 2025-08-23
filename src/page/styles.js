import { updatePageColors, extractColorsCategorized } from "./siteMods/colorUtils";
import { handlePresetsUpdate, getPresets } from "./siteMods/presets";
import { globalState, uiState } from "./siteMods/state";
import "./siteMods/listeners.js";

let currentCategorizedColors = null; 
let currentBackgroundColors = null; 
let newCategorizedColors = null;
let newBackgroundColors = null;
let currentUrl = null; 
let lastChangeTime = null;
let currentTime = null;
let timeSinceLastChange = currentTime - lastChangeTime;

window.onload = function () {
    globalState.setCurrentOrigin(window.location.origin); 
    console.log("Obtained location");
    getPresets();

    currentCategorizedColors = extractColorsCategorized();
    currentBackgroundColors = [...currentCategorizedColors.background.slice(0, 3)].sort();
    currentUrl = window.location.href; 
    lastChangeTime = performance.now();
    resetNoChangeTimer();

    /* Waits 1.5 seconds and then gets the initial background color scheme of the page.
    After that, it keeps checking the page to see if any mutations change that color scheme.
    If it does,  it reapplies the colors to ensure that the page stays the right background colors. */
    let observer = new MutationObserver(() => { 
        newCategorizedColors = extractColorsCategorized();
        newBackgroundColors = [...newCategorizedColors.background.slice(0, 3)].sort();
        if (JSON.stringify(currentBackgroundColors) !== JSON.stringify(newBackgroundColors)) {
            currentCategorizedColors = newCategorizedColors;
            currentBackgroundColors = newBackgroundColors;
            currentTime = performance.now();
            timeSinceLastChange = currentTime - lastChangeTime;
            console.log(`Time since last color update: ${timeSinceLastChange.toFixed(2)} ms`);
            lastChangeTime = currentTime;

            resetNoChangeTimer();
        }
    });

    function checkUrlChange() { // Detects URL changes in SPAs and restart the observer
        if (window.location.href !== currentUrl) {
            console.log("Page changed:", window.location.href);
            currentUrl = window.location.href;
            handlePageMutation()
            startObserver(); // Restart observer on new page
        }
    }
    
    function startObserver() {
        if (observer) observer.disconnect(); // Ensure the previous observer is removed
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    startObserver(); // Observe DOM changes
    setInterval(checkUrlChange, 1000); // Periodically check for URL changes in SPAs
    window.addEventListener("popstate", checkUrlChange); // Listen for back/forward navigation
    setTimeout(() => observer.disconnect(), 30000); // Disconnect observer after set period
};

handlePresetsUpdate();

function handlePageMutation() {
    let initialCategorizedColors = globalState.getInitialCategorizedColors();
    let initialBackgroundColors = globalState.getInitialBackgroundColors();

    if (!initialCategorizedColors) {
        initialCategorizedColors = currentCategorizedColors; 

        initialBackgroundColors = [...initialCategorizedColors.background.slice(0, 3)].sort();
        if (uiState.getBackgroundColors() == null) {
            uiState.setBackgroundColors(initialBackgroundColors);
        }
        console.log("Initial colors: " + initialCategorizedColors.background);
        console.log("Initial colors: " + initialBackgroundColors);

        globalState.setInitialBackgroundColors(initialBackgroundColors);
        globalState.setInitialCategorizedColors(initialCategorizedColors);
    }
    const newColors = uiState.getBackgroundColors();
    updatePageColors(initialBackgroundColors[0], newColors[0]);
    updatePageColors(initialBackgroundColors[1], newColors[1]);
    updatePageColors(initialBackgroundColors[2], newColors[2]);
}

let noChangeTimer = null;
let initialRunCompleted = false;

function resetNoChangeTimer() {
    if (noChangeTimer) {
        clearTimeout(noChangeTimer);
    }

    if (!initialRunCompleted) {
        // Initial 1.5-second delay
        noChangeTimer = setTimeout(() => {
            handlePageMutation();
            initialRunCompleted = true; // Mark initial run as done
        }, 1500);
    } else {
        // Instant run after initial
        handlePageMutation();
    }
}