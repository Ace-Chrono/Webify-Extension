export function updatePageColors(baseColor, newBaseColor) {
    document.querySelectorAll('*').forEach((element) => {
        if (shouldSkipElement(element)) return;

        const styles = getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const textColor = styles.color;

        if (isValidColor(backgroundColor) && colorsMatch(backgroundColor, baseColor)) {
            element.style.backgroundColor = newBaseColor;
        }
        if (isValidColor(textColor) && colorsMatch(textColor, baseColor)) {
            element.style.color = newBaseColor;
        }
    });
}

export function extractColorsCategorized() {
    const foregroundAreas = new Map();
    const backgroundAreas = new Map();

    document.querySelectorAll('*').forEach((element) => {
        if (shouldSkipElement(element)) return;

        const styles = getComputedStyle(element);
        const foregroundColor = styles.color;
        const backgroundColor = styles.backgroundColor;

        const area = element.offsetWidth * element.offsetHeight;
        if (area <= 0) return;
        if (isValidColor(foregroundColor)) {
            foregroundAreas.set(foregroundColor, (foregroundAreas.get(foregroundColor) || 0) + area);
        }
        if (isValidColor(backgroundColor)) {
            backgroundAreas.set(backgroundColor, (backgroundAreas.get(backgroundColor) || 0) + area);
        }
    });
    const foreground = [...foregroundAreas.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    const background = [...backgroundAreas.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    return { foreground, background };
}

export function darkenColor(color, amount) {
    let [r, g, b] = hexToRgb(color);
    r = Math.max(0, Math.round(r * ((100-amount)/100)));
    g = Math.max(0, Math.round(g * ((100-amount)/100)));
    b = Math.max(0, Math.round(b * ((100-amount)/100)));

    return `rgb(${r}, ${g}, ${b})`;
}

export function invertColor(rgb) {
    let [r, g, b] = rgb.match(/\d+/g).map(Number);
    let [h, s, l] = rgbToHsl(r, g, b);
    l = 100 - l;
    let [newR, newG, newB] = hslToRgb(h, s, l);
    return `rgb(${newR}, ${newG}, ${newB})`;
}

function isValidColor(color) {
    const excludedValues = ['inherit', 'initial', 'none'];
    return !excludedValues.includes(color) && (color.startsWith("rgb") || color.startsWith("#"));
}

function shouldSkipElement(element) {
    const ignoredTags = ['SCRIPT', 'LINK', 'META', 'STYLE', 'SVG', 'PATH', 'NOSCRIPT', 'IMG'];
    if (ignoredTags.includes(element.tagName)) return true;
    
    const styles = getComputedStyle(element);
    return styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0' || isFullyTransparent(styles.color) || isFullyTransparent(styles.backgroundColor);
}

function isFullyTransparent(color) {
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    return rgbaMatch && rgbaMatch[4] !== undefined && parseFloat(rgbaMatch[4]) < 1;
}

function colorsMatch(color1, color2) {
    return normalizeColor(color1) === normalizeColor(color2);
}

function normalizeColor(color) {
    const context = document.createElement('canvas').getContext('2d');
    context.fillStyle = color;
    return context.fillStyle;
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}