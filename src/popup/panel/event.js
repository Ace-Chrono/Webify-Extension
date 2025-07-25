import { getColorAtPosition } from './utils.js';

let advancedPopup = null;
let codePopup = null;

export function initEvents(dom) {
    dom.log.textContent = "Loaded";

    dom.colorWheelImage.addEventListener("click", (event) => {
        const color = getColorAtPosition(event.offsetX, event.offsetY, dom.colorWheelImage);
        dom.log.textContent = "Selected color: " + color;
        chrome.runtime.sendMessage({ action: 'changeColor', color });
    });

    dom.invertButton.addEventListener("click", () => {
        dom.log.textContent = "Invert clicked";
        chrome.runtime.sendMessage({ action: 'invertColor' });
    });

    dom.resetButton.addEventListener("click", () => {
        dom.log.textContent = "Reset clicked";
        chrome.runtime.sendMessage({ action: 'reset' });
    });

    Array.from(dom.fonts).forEach(fontEl => {
        fontEl.addEventListener("click", (event) => {
        const font = window.getComputedStyle(event.target).fontFamily;
        dom.log.textContent = "Font: " + font;
        chrome.runtime.sendMessage({ action: 'changeFont', font });
        });
    });

    dom.advancedButton.addEventListener("click", () => {
        dom.log.textContent = "Advanced clicked";
        if (!advancedPopup || advancedPopup.closed) {
        advancedPopup = window.open('advanced.html', 'AdvancedOptions', 'width=700,height=200');
        } else {
        advancedPopup.focus();
        }
    });

    dom.caseButton.addEventListener("click", () => {
        dom.log.textContent = "Case clicked";
        chrome.runtime.sendMessage({ action: 'changeCase' });
    });

    dom.sizeButton.addEventListener("click", () => {
        dom.log.textContent = "Size clicked";
        chrome.runtime.sendMessage({ action: 'changeSize' });
    });

    dom.zapButton.addEventListener("click", () => {
        dom.log.textContent = "Zap clicked";
        chrome.runtime.sendMessage({ action: 'zap' });
    });

    dom.codeButton.addEventListener("click", () => {
        dom.log.textContent = "Code clicked";
        if (!codePopup || codePopup.closed) {
        codePopup = window.open('code.html', 'CodeEditor', 'width=600,height=800');
        } else {
        codePopup.focus();
        }
    });

    dom.shareButton.addEventListener("click", () => {
        dom.log.textContent = "Share clicked";
        chrome.runtime.sendMessage({ action: 'share' });
    });

    dom.loadButton.addEventListener("click", () => {
        const file = dom.fileUploader.files?.[0];
        if (!file) {
        dom.log.textContent = "No file selected.";
        return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
        try {
            const jsonData = JSON.parse(event.target.result);
            dom.log.textContent = "Loaded JSON: " + JSON.stringify(jsonData);
            chrome.runtime.sendMessage({ action: "load", data: jsonData });
        } catch (error) {
            dom.log.textContent = "Error loading file";
        }
        };
        reader.readAsText(file);
    });

    dom.saveButton.addEventListener("click", () => {
        dom.log.textContent = "Save clicked";
        chrome.runtime.sendMessage({ action: 'save', name: dom.presetNameField.value });
    });

    dom.clearButton.addEventListener("click", () => {
        dom.log.textContent = "Clear clicked";
        chrome.runtime.sendMessage({ action: 'clear' });
    });

    window.addEventListener("unload", () => {
        if (advancedPopup && !advancedPopup.closed) advancedPopup.close();
        if (codePopup && !codePopup.closed) codePopup.close();
    });
}