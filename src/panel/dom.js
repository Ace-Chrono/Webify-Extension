const elements = {};

const elementIds = [
    'presetItems',
    'log',
    'colorWheelImage',
    'invertButton',
    'resetButton',
    'advancedButton',
    'caseButton',
    'sizeButton',
    'zapButton',
    'codeButton',
    'shareButton',
    'fileUploader',
    'loadButton',
    'saveButton',
    'clearButton',
    'presetNameField'
];

function initDOM() {
    elementIds.forEach(id => {
        elements[id] = document.getElementById(id);
    });

    elements.fonts = document.getElementsByClassName("fontButton");
}

export function getDOM() {
    initDOM();
    return elements; 
}