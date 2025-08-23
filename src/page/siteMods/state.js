/*
let zapMode = false; 
let lastHighlightedElement = null;
const originalHighlightedElementStyle = {};

let userPresets = []; 
let presetMap = {};
let presetData = null;

let elementsWithText = [];

let currentUserBackgroundColors = null;
let currentFont = null; 
let currentContrast = 100;
let currentBrightness = 100;
let currentSaturation = 100;
let zoomedIn = false; 
let currentCase = "normal"; 
let currentCSSChanges = ""; 

let currentOrigin = null; 

let initialBackgroundColors = null; 
*/

const internalGlobalState = {
    currentOrigin: null,
    initialBackgroundColors: null,
    initialCategorizedColors: null
};

const zapInternalState = {
    elements: [],
    elementIDs: [],
    zapMode: false,
    lastHighlightedElement: null,
    originalHighlightedElementStyle: {}
};

const uiInternalState = {
    backgroundColors: null,
    font: null,
    contrast: 100,
    brightness: 100,
    saturation: 100,
    zoomedIn: false,
    textCase: "normal",
    cssChanges: "",
};

const textElementsInternalState = {
    textElements: []
};

const presetInternalState = {
    applied: false,
    presets: [],
    presetMap: {},
    presetData: null
};

export const globalState = {
    getCurrentOrigin: () => internalGlobalState.currentOrigin,
    setCurrentOrigin: (origin) => { internalGlobalState.currentOrigin = origin },

    getInitialBackgroundColors: () => internalGlobalState.initialBackgroundColors,
    setInitialBackgroundColors: (colors) => { internalGlobalState.initialBackgroundColors = colors },

    getInitialCategorizedColors: () => internalGlobalState.initialCategorizedColors,
    setInitialCategorizedColors: (colors) => { internalGlobalState.initialCategorizedColors = colors },
};

export const zapState = {
    getElements: () => zapInternalState.elements,
    setElements: (els) => { zapInternalState.elements = els }, 
    addElement: (el) => zapInternalState.elements.push(el),
    resetElements: () => { zapInternalState.elements.length = 0; },

    getIDs: () => zapInternalState.elementIDs,
    addID: (id) => zapInternalState.elementIDs.push(id),
    resetIDs: () => { zapInternalState.elementIDs.length = 0; },

    getZapMode: () => zapInternalState.zapMode,
    setZapMode: (value) => { zapInternalState.zapMode = value },

    getLastHighlighted: () => zapInternalState.lastHighlightedElement,
    setLastHighlighted: (el) => { zapInternalState.lastHighlightedElement = el },

    getOriginalStyle: () => zapInternalState.zapMode,
    setOriginalStyle: (style) => { zapInternalState.zapMode = style },
};

export const uiState = {
    getBackgroundColors: () => uiInternalState.backgroundColors,
    setBackgroundColors: (colors) => { uiInternalState.backgroundColors = colors; },

    getFont: () => uiInternalState.font,
    setFont: (font) => { uiInternalState.font = font; },

    getContrast: () => uiInternalState.contrast,
    setContrast: (contrast) => { uiInternalState.contrast = contrast; },

    getBrightness: () => uiInternalState.brightness,
    setBrightness: (brightness) => { uiInternalState.brightness = brightness; },

    getSaturation: () => uiInternalState.saturation,
    setSaturation: (saturation) => { uiInternalState.saturation = saturation; },

    getZoomedIn: () => uiInternalState.zoomedIn,
    setZoomedIn: (zoomedIn) => { uiInternalState.zoomedIn = zoomedIn; },

    getTextCase: () => uiInternalState.textCase,
    setTextCase: (textCase) => { uiInternalState.textCase = textCase; },

    getCSSChanges: () => uiInternalState.cssChanges,
    setCSSChanges: (css) => { uiInternalState.cssChanges = css; },
};

export const textElementsState = {
    getTextElements: () => textElementsInternalState.textElements,
    setTextElements: (elements) => { textElementsInternalState.textElements = elements }
}

export const presetState = {
    isApplied: () => presetInternalState.applied,
    setApplied: (applied) => { presetInternalState.applied = applied },

    getPresets: () => presetInternalState.presets,
    setPresets: (presets) => { presetInternalState.presets = presets },
    addPreset: (preset) => {
        presetInternalState.presets.push(preset);
    },

    getPresetMap: () => presetInternalState.presetMap,
    setPresetMap: (map) => { presetInternalState.presetMap = map },

    getPresetData: () => presetInternalState.presetData,
    setPresetData: (data) => { presetInternalState.presetData = data } 
}

