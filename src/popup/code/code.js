import { css } from '@codemirror/lang-css';
import { basicSetup, EditorView } from 'codemirror';

document.addEventListener("DOMContentLoaded", function() {
    const targetElement = document.getElementById("cssEditor");

    const editorView = new EditorView({
        extensions: [
            basicSetup,
            css(),
        ],
        parent: targetElement,
    });

    function getUserCSS(callback) {
        chrome.storage.local.get(['userPresets', 'currentOrigin', 'tempCSS'], (data) => {
            const { userPresets = [], currentOrigin, tempCSS } = data;

            if (tempCSS) {
                callback(tempCSS);
                return;
            }

            const presetMap = {};
            userPresets.forEach(preset => {
                presetMap[preset.websiteURL] = preset;
            });

            const currentPreset = presetMap[currentOrigin] || null;
            const CSSChanges = currentPreset ? currentPreset.CSSChanges : '';
            callback(CSSChanges);
        });
    }

    getUserCSS((cssCode) => {
        if (cssCode) {
            editorView.dispatch({
                changes: { from: 0, to: editorView.state.doc.length, insert: cssCode }
            });
        }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.userPresets) {
            getUserCSS((cssCode) => {
                if (cssCode) {
                    editorView.dispatch({
                        changes: { from: 0, to: editorView.state.doc.length, insert: cssCode }
                    });
                }
            });
        }
    });
    
    const injectButton = document.getElementById('inject_button');

    injectButton.addEventListener('click', function() {
        const cssCode = editorView.state.doc.toString();
        chrome.storage.local.set({ tempCSS: cssCode }, () => {
            console.log("Temporary CSS saved");
        });
        chrome.runtime.sendMessage({ action: 'injectCSS', css: cssCode});
    });
});