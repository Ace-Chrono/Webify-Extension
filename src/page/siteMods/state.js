const internalGlobalState = {
    currentOrigin: null
};

const colorEngineInternalState = {
    activeColor: null, 
    mode: "normal",
    entryToBrightness: new Map(),
    brightnessToVars: new Map(),
    varsToColor: new Map(),
    originalStyles: new Map()
}

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

    getInitialPageMode: () => internalGlobalState.initialPageMode,
    setInitialPageMode: (initialPageMode) => { internalGlobalState.initialPageMode = initialPageMode },
};

export const colorEngineState = {
    getActiveColor: () => colorEngineInternalState.activeColor,
    setActiveColor: (activeColor) => { colorEngineInternalState.activeColor = activeColor },

    getMode: () => colorEngineInternalState.mode,
    setMode: (mode) => { colorEngineInternalState.mode = mode },

    getEntryToBrightness: () => colorEngineInternalState.entryToBrightness,
    setEntryToBrightness: (entryToBrightness) => { colorEngineInternalState.entryToBrightness = entryToBrightness },

    getVarsToColor: () => colorEngineInternalState.varsToColor,
    setVarsToColor: (varsToColor) => { colorEngineInternalState.varsToColor = varsToColor },

    getOriginalStyles: () => colorEngineInternalState.originalStyles,
    setOriginalStyles: (originalStyles) => { colorEngineInternalState.originalStyles = originalStyles },
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

