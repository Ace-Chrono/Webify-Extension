import iro from "@jaames/iro";

const elements = {};

const elementIds = [
    'presetItems',
    'log',
    'colorWheel',
    'invertButton',
    'resetButton',
    'advancedButton',
    'caseButton',
    'sizeButton',
    'zapButton',
    'codeButton',
    'shareButton',
    'fileUploader',
    'signInButton',
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

export const colorWheel = new iro.ColorPicker("#colorWheel", {
  width: 150,
  color: "#f00"
});

export function getDOM() {
    initDOM();
    return elements; 
}