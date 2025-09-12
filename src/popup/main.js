import { initPresets, updatePresetList } from "./panel/presets";
import { getDOM } from "./panel/dom";
import { initEvents } from "./panel/event";

document.addEventListener("DOMContentLoaded", function() { 
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            const activeTabId = tabs[0].id;
            chrome.storage.local.set({ 'activeTabId': activeTabId }, function() {
                console.log('Active tab ID saved:', activeTabId);
            });
        }
    });

    const presetItems = document.getElementById('presetItems');
    initPresets(presetItems);

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.userPresets) {
            updatePresetList();
        }
    });

    const dom = getDOM();
    initEvents(dom);
});
