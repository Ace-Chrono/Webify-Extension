import { colorEngineState } from "../state";
import { extractElementDetails } from "./colorExtraction";
import { mapEntryToBrightness, mapVarsToColor } from "./colorMap";

export async function addElements(entries){
    const elements = await extractElementDetails(entries);
    if (!elements.length) return;

    mapEntryToBrightness(elements);
    const activeColor = colorEngineState.getActiveColor();
    const mode = colorEngineState.getMode();

    if (activeColor){
        mapVarsToColor(activeColor, mode);
        applyColors();
    }
}

export function changeColor(color, mode){
    mapVarsToColor(color, mode ?? undefined);
    applyColors();
    console.log(colorEngineState.getMode());
}

export function invertColor(){
    const color = colorEngineState.getActiveColor();
    if (colorEngineState.getActiveColor()){
        const currentMode = colorEngineState.getMode();
        const oppositeMode = currentMode === 'inverse' ? 'normal' : 'inverse';
        mapVarsToColor(color, oppositeMode);
        applyColors();
    }
}

export function resetColor() {
    const entryToBrightness = colorEngineState.getEntryToBrightness();

    for (const el of entryToBrightness.keys()) {
        delete el.dataset.brightnessText;
        delete el.dataset.brightnessSurface;
    }

    document.getElementById('color-engine-vars')?.remove();

    colorEngineState.setVarsToColor(new Map());
    colorEngineState.setActiveColor(null);
}

/*---Helper Functions---*/

function ensureVars() {
    let style = document.getElementById('color-engine-vars');
    if (!style) {
        style = document.createElement('style');
        style.id = 'color-engine-vars';
        document.head.appendChild(style);
    }
    return style;
}

function applyColors() {
    ensureRules();

    const entryToBrightness = colorEngineState.getEntryToBrightness();
    const varsToColor = colorEngineState.getVarsToColor();

    const style = ensureVars();
    let css = ':root {\n';

    for (const [varName, color] of varsToColor) {
        css += `  ${varName}: ${color};\n`;
    }
    css += '}\n';
    style.textContent = css;

    for (const [el, record] of entryToBrightness) {
        if (record.text != null) {
            el.dataset.brightnessText = record.text;
        }
        if (record.surface != null) {
            el.dataset.brightnessSurface = record.surface;
        }
    }
}

function ensureRules() {
    if (document.getElementById('color-engine-rules')) return;

    const style = document.createElement('style');
    style.id = 'color-engine-rules';

    let css = '';

    for (let i = 0; i < 10; i++) {
        css += `
        [data-brightness-text="${i}"] {
        color: var(--text-${i}) !important;
        }
        [data-brightness-surface="${i}"] {
        background-color: var(--surface-${i}) !important;
        }
        `;
    }

    style.textContent = css;
    document.head.appendChild(style);
}