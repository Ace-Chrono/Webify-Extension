import { css } from '@codemirror/lang-css';
import { basicSetup, EditorView } from 'codemirror';

document.addEventListener("DOMContentLoaded", function() {
    //const initialText = 'body { background-color: #f0f0f0 !important; }';
    const targetElement = document.getElementById("cssEditor");

    const editorView = new EditorView({
        //doc: initialText,
        extensions: [
            basicSetup,
            css(),
        ],
        parent: targetElement,
    });

    function getUserCSS(callback) {
        chrome.storage.local.get('userPresets', (data) => {
            const userPresets = data.userPresets || [];
            const presetMap = {};
            userPresets.forEach(preset => {
                presetMap[preset.websiteURL] = preset;
            });
            chrome.storage.local.get(['currentOrigin'], (data) => {
                const currentOrigin = data.currentOrigin;
                const currentPreset = presetMap[currentOrigin] || null;
                const CSSChanges = currentPreset ? currentPreset.CSSChanges : null;
                callback(CSSChanges);
            });
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
        console.log(cssCode);
        chrome.runtime.sendMessage({ action: 'injectCSS', css: cssCode});
    });
});