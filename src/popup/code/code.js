import { css } from '@codemirror/lang-css';
import { basicSetup, EditorView } from 'codemirror';

document.addEventListener("DOMContentLoaded", function() {
    const targetElement = document.getElementById("cssEditor");
    const editorView = new EditorView({
        extensions: [
            basicSetup,
            css(),
            EditorView.updateListener.of(update => {
                if (update.docChanged) {
                    markDirty();
                }
            })
        ],
        parent: targetElement,
    });

    let isDirty = true;
    let originalCSS = '';

    function markDirty() {
        const cssCode = editorView.state.doc.toString();
        isDirty = (cssCode !== originalCSS);
        updateUI();
    }

    function updateUI() {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        if (isDirty) {
            statusEl.textContent = "Unsaved changes. Inject to save temporarily, add the preset to save completely.";
            statusEl.style.color = "orange";
        } else {
            statusEl.textContent = "Preset saved.";
            statusEl.style.color = "green";
        }
    }

    function getUserCSS(callback) {
        chrome.storage.local.get(['userPresets', 'currentOrigin', 'tempCSS'], (data) => {
            const { userPresets = [], currentOrigin, tempCSS } = data;
            const presetMap = {};
            userPresets.forEach(preset => {
                presetMap[preset.websiteURL] = preset;
            });
            const currentPreset = presetMap[currentOrigin] || null;
            const CSSChanges = currentPreset ? currentPreset.CSSChanges : '';
            originalCSS = CSSChanges;

            if (tempCSS) {
                callback(tempCSS);
                return;
            } else {
                callback(CSSChanges);
            }
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

    const reloadButton = document.getElementById('reload_button');

    reloadButton.addEventListener('click', function() {
        chrome.storage.local.set({ tempCSS: null }, () => {
            console.log("Temporary CSS remmoved");
        });
    });
});