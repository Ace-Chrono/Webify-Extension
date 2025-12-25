import { handlePresetsUpdate, getPresets } from "./siteMods/presets";
import { colorEngineState, globalState } from "./siteMods/state";
import { handleUserChanges } from "./siteMods/listeners.js";
import { extractElementDetails } from "./siteMods/colorUtilsHelpers/colorExtraction.js";
import { mapEntryToBrightness, mapVarsToColor } from "./siteMods/colorUtilsHelpers/colorMap.js";
import { addElements } from "./siteMods/colorUtilsHelpers/colorApplication.js";

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
        const currentOrigin = window.location.origin;
        globalState.setCurrentOrigin(currentOrigin);
        chrome.storage.local.set({ currentOrigin }, () => {
            console.log('Current origin saved:', currentOrigin);
        });
        addElements();

        let scheduled = false;
        let pendingElements = new Set();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "characterData") {
                    const el = mutation.target.parentElement?.closest('[data-ce-seen]');
                    if (el) {
                        delete el.dataset.ceProcessed;
                        pendingElements.add(el);
                    }
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (["SCRIPT", "STYLE", "META", "LINK"].includes(node.tagName)) continue;
                    if (node.dataset.ceSeen) continue;

                    collectShallow(node, 2).forEach(el => pendingElements.add(el));
                }
            }

            if (scheduled || pendingElements.size === 0) return;
            scheduled = true;

            requestAnimationFrame(async () => {
                scheduled = false;
                const elements = Array.from(pendingElements);
                pendingElements.clear();
                addElements(elements); 
            });
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            characterData: true
        });
        setupScrollRescan();

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

function collectShallow(root, maxDepth = 2) {
    const out = [];
    const queue = [{ el: root, depth: 0 }];

    while (queue.length) {
        const { el, depth } = queue.shift();
        out.push(el);

        if (depth >= maxDepth) continue;

        for (const child of el.children) {
            if (child.dataset.ceSeen) continue;
            child.dataset.ceSeen = "1";
            queue.push({ el: child, depth: depth + 1 });
        }
    }

    return out;
}

function setupScrollRescan() {
    let raf = null;

    const handler = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = null;
            rescanVisibleElements();
        });
    };

    window.addEventListener("scroll", handler, { passive: true });

    document.querySelectorAll('[style*="overflow"], [role="presentation"]').forEach(el => {
        el.addEventListener("scroll", handler, { passive: true });
    });
}

function rescanVisibleElements() {
    const candidates = [];

    for (const el of document.querySelectorAll('[data-ce-seen]')) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

        delete el.dataset.ceProcessed;
        candidates.push(el);
    }

    if (!candidates.length) return;

    extractElementDetails(candidates).then(extracted => {
        if (!extracted.length) return;
        addElements(extracted);
    });
}
