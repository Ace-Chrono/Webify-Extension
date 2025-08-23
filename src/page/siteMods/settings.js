import { updatePageColors } from "./colorUtils";
import { textElementsState, uiState } from "./state";

export function changeBackgroundColor(newColors) {
    const oldColors = uiState.getBackgroundColors();

    for (let i = 0; i < newColors.length; i++) {
        updatePageColors(oldColors[i], newColors[i]);
    }

    uiState.setBackgroundColors(newColors);
}

export function changeFont(newFont) {
    let elementsWithText = textElementsState.getTextElements();
    if (elementsWithText.length == 0){
        elementsWithText = findElementsWithText(document);
    }
    for (let i = 0; i < elementsWithText.length; i++) {
        elementsWithText[i].style.fontFamily = newFont;
    }
    textElementsState.setTextElements(elementsWithText);
    uiState.setFont(newFont);
}

export function changeAdvancedSettings(newContrast, newBrightness, newSaturation) {
    uiState.setContrast(newContrast);
    uiState.setBrightness(newBrightness);
    uiState.setSaturation(newSaturation);
    document.documentElement.style.filter = `
        contrast(${newContrast}%)
        brightness(${newBrightness}%)
        saturate(${newSaturation}%)
    `;
}

export function changeSize(newZoom) {
    uiState.setZoomedIn(newZoom);
    if (uiState.getZoomedIn() == false){
        document.body.style.zoom = 150 + '%';
        uiState.setZoomedIn(true);
    }
    else if (uiState.getZoomedIn() == true){
        document.body.style.zoom = 100 + '%';
        uiState.setZoomedIn(false);
    }
}

export function changeCase(newCase, isClick) {
    uiState.setTextCase(newCase);

    let elementsWithText = textElementsState.getTextElements();
    if (elementsWithText.length == 0) {
        elementsWithText = findElementsWithText(document);
    }

    if (isClick) {
        if (uiState.getTextCase() === 'normal') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'uppercase';
            }
            uiState.setTextCase('upper');
        } else if (uiState.getTextCase() === 'upper') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'lowercase';
            }
            uiState.setTextCase('lower');
        } else if (uiState.getTextCase() === 'lower') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'none';
            }
            uiState.setTextCase('normal');
        }
    } else {
        if (uiState.getTextCase() === 'normal') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'none';
            }
        } else if (uiState.getTextCase() === 'upper') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'uppercase';
            }
        } else if (uiState.getTextCase() === 'lower') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'lowercase';
            }
        }
    }

    textElementsState.setTextElements(elementsWithText);
    console.log(uiState.textCase);
}

export function injectCSS(cssChanges) {
    uiState.setCSSChanges(cssChanges);

    let styleElement = document.getElementById('injectedCSS');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'injectedCSS';
        document.head.appendChild(styleElement);
    }
    styleElement.textContent = uiState.getCSSChanges();
}

function findElementsWithText(rootNode) { //Finds all the elements in the tab with text
    // Get all elements in the document
    const allElements = rootNode.querySelectorAll('*');
    const elementsWithText = [];

    // Loop through each element
    allElements.forEach(element => {
        // Check if the element has any text nodes that are not empty or just whitespace
        const hasText = Array.from(element.childNodes).some(node => {
            return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '';
        });

        // If the element has text, add it to the results array
        if (hasText) {
            elementsWithText.push(element);
        }
    });

    return elementsWithText;
}