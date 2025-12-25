import { colorEngineState } from "../state";

const BRIGHTNESS_BUCKETS = 10;

export function mapEntryToBrightness(entries) {
    entries = filterEntries(entries);
    const signalBuckets = { text: [], surface: [] };
    const MIN_ALPHA = 0.5

    for (const entry of entries) {
        if (entry.hasText && entry.textColor) {
            signalBuckets.text.push({ color: entry.textColor.hex, entry, weight: entry.area });
        }
        if (entry.hasSurface && (entry.backgroundColor?.alpha ?? 0) >= MIN_ALPHA) {
            signalBuckets.surface.push({ color: entry.backgroundColor.hex, entry, weight: entry.area });
        }
    }

    const entryToBrightness = colorEngineState.getEntryToBrightness() || new Map();

    for (const kind of ['text', 'surface']) {
        const samples = signalBuckets[kind];
        if (!samples.length) continue;

        for (const { color, entry } of samples) {
            let record = entryToBrightness.get(entry.element);
            if (!record) {
                record = {};
                entryToBrightness.set(entry.element, record);
            }

            if (record[kind] != null) continue;

            const lab = rgbToLab(hexToRgb(color));
            record[kind] = brightnessToBucket(lab.L, BRIGHTNESS_BUCKETS);
        }
    }

    colorEngineState.setEntryToBrightness(entryToBrightness);
}

export function mapVarsToColor(seedColor, mode = colorEngineState.getMode() || "normal"){
    if (!seedColor) {
        return;
    }

    const tones = generateToneScale(seedColor, BRIGHTNESS_BUCKETS);

    const varsToColor = new Map();
    for (const kind of ['text', 'surface']) {
        for (let i = 0; i < BRIGHTNESS_BUCKETS; i++) {
            const varName = `--${kind}-${i}`;
            const tone = mode === 'inverse' ? tones[BRIGHTNESS_BUCKETS - 1 - i] : tones[i];
            varsToColor.set(varName, tone);
        }
    }
    console.log(varsToColor);

    colorEngineState.setVarsToColor(varsToColor);
    colorEngineState.setActiveColor(seedColor);
    colorEngineState.setMode(mode);

    console.log(colorEngineState.getVarsToColor());
}

/*---Helper Functions---*/

function filterEntries(entries = []) {
    const MIN_AREA = 25;
    const MIN_ALPHA = 0.05;
    const MIN_TEXT_LENGTH = 1;

    return entries.filter(entry => {
        if (!entry?.element) return false;

        const el = entry.element;

        let hasText = false;
        if (entry.hasText && entry.textColor) {
            const alpha = Number(entry.textColor.alpha ?? 0);
            const textLength = (el.textContent || '').trim().length;
            hasText = alpha >= MIN_ALPHA && textLength >= MIN_TEXT_LENGTH;
        }

        let hasSurface = false;
        if (entry.hasSurface && entry.backgroundColor) {
            const alpha = Number(entry.backgroundColor.alpha ?? 0);
            const area = Number(entry.area ?? 0);
            hasSurface = alpha >= MIN_ALPHA && area >= MIN_AREA;
        }

        return hasText || hasSurface;
    });
}

function generateToneScale(seedHex, buckets) {
    const [h, s] = rgbToHsl(hexToRgb(seedHex));

    const MIN_L = 5;
    const MAX_L = 95;

    const tones = new Array(buckets);

    for (let i = 0; i < buckets; i++) {
        const t = buckets === 1 ? 0.5 : i / (buckets - 1);
        const l = MIN_L + t * (MAX_L - MIN_L);
        tones[i] = hslToHex(h, s, l);
    }

    return tones;
}

function brightnessToBucket(L, buckets) {
    return Math.min(
        buckets - 1,
        Math.max(
            0,
            Math.floor((L / 100) * buckets)
        )
    );
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    return hex.match(/.{2}/g).map(h => parseInt(h, 16));
}

function rgbToLab([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const pivot = c => (c > 0.04045 ? Math.pow((c + 0.055)/1.055, 2.4) : c / 12.92);
    r = pivot(r); g = pivot(g); b = pivot(b);

    const X = r*0.4124564 + g*0.3575761 + b*0.1804375;
    const Y = r*0.2126729 + g*0.7151522 + b*0.0721750;
    const Z = r*0.0193339 + g*0.1191920 + b*0.9503041;

    const refX = 0.95047, refY = 1.00000, refZ = 1.08883;
    const fx = X / refX, fy = Y / refY, fz = Z / refZ;
    const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787*t + 16/116);

    return {
        L: 116*f(fy) - 16,
        a: 500*(f(fx)-f(fy)),
        b: 200*(f(fy)-f(fz))
    };
}

function hslToHex(h,s,l) {
    l /= 100; s /= 100;
    const a = s * Math.min(l, 1-l);
    const f = n => {
        const k = (n + h/30) % 12;
        const c = l - a * Math.max(-1, Math.min(k-3, Math.min(9-k,1)));
        const hex = Math.round(255*c).toString(16);
        return hex.length===1 ? '0'+hex : hex;
    };
    return '#'+f(0)+f(8)+f(4);
}

function rgbToHsl([r,g,b]) {
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0;
    const l = (max+min)/2;
    if(max!==min){
        const d = max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
            case r: h=(g-b)/d + (g<b?6:0); break;
            case g: h=(b-r)/d+2; break;
            case b: h=(r-g)/d+4; break;
        }
        h *= 60;
    }
    return [Math.round(h), Math.round(s*100), Math.round(l*100)];
}