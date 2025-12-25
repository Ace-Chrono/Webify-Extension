export async function extractElementDetails(newElements = null) {
	const elements = findViableElements(newElements); 
	const inViewportElements = await isInViewport(elements);
	
	const entries = []; 
	for (const el of elements) {
		const style = getComputedStyle(el);

		const areaThresholdPx = 25; 
		const rect = el.getBoundingClientRect();
		const area = Math.max(0, Math.round(rect.width * rect.height));
		if (area < areaThresholdPx) {
			continue;
		}

		const rawBg = style.getPropertyValue('background-color') || style.backgroundColor || '';
		const rawColor = style.getPropertyValue('color') || style.color || '';

		const bgDetails = getColorDetails(rawBg);
		const colorDetails = getColorDetails(rawColor);

		const containsText = hasText(el);
		const containsSurface = hasSurface(el, style, area); 

		const entry = {
			element: el,
			textColor: colorDetails,
			backgroundColor: bgDetails,
			hasText: containsText,
			hasSurface: containsSurface,
			area, 
			inViewport: inViewportElements.has(el), 
			contrast: null,
			usesCssVar: Boolean(bgDetails.fromVariable || colorDetails.fromVariable),
		}

		entries.push(entry); 
	}
	
	return entries;
}

/*---Helper Functions---*/

function findViableElements(newElements = null) {
	const toSkip = ['script', 'style', 'noscript', 'meta', 'link']
	const maxElements = 2000; 
	const elements = newElements || Array.from(document.querySelectorAll('*'));
	const candidates = elements
		.filter(el => {
			const styles = getComputedStyle(el);
			if (styles.display === 'none' 
				|| styles.visibility === 'hidden' 
				|| styles.opacity === '0'
				|| styles.mixBlendMode && styles.mixBlendMode !== 'normal'
				|| styles.backgroundImage && styles.backgroundImage !== 'none'
				|| !(el instanceof Element)
				|| toSkip.some(s => el.matches(s))
			){
				return false;
			}
			return true
		})
		.slice(0, maxElements);

	return candidates; 
}

async function isInViewport(elements) {
	const inViewportSet = new Set();
	if ('IntersectionObserver' in window) {
		await new Promise((resolve) => {
			const observer = new IntersectionObserver((entries) =>{
				for (const entry of entries) {
					if (entry.isIntersecting) {
						inViewportSet.add(entry.target);
					}
				}
			});

			elements.forEach((el) => observer.observe(el));
			setTimeout(() => {
				observer.disconnect();
				resolve(); 
			}, 250);
		})
	}

	return inViewportSet; 
}

function getColorDetails(rawColor) {
	const colorVariables = rawColor.match(/var\(\s*(--[A-Za-z0-9\-_]+)\s*(?:,\s*[^)]+)?\)/);
	const colorVariable = colorVariables ? colorVariables[1] : null;
	const parsedColor = parseCssColor(rawColor);
	const colorDetails = {
		rgb: parsedColor.rgb,
		alpha: clamp(parsedColor.alpha),
		hsl: rgbToHsl(parsedColor.rgb),
		hex: rgbToHex(parsedColor.rgb),
		cssRaw: rawColor,
		fromVariable: colorVariable
	}

	return colorDetails; 
}

function parseCssColor(input) {
	try {
		const el = document.createElement('div');
		el.style.color = input;
		document.body.appendChild(el);
		const cs = getComputedStyle(el).color;
		document.body.removeChild(el);
		const m = cs.match(/rgba?\(\s*([0-9]+)[^\d]+([0-9]+)[^\d]+([0-9]+)(?:[^\d.]+([0-9.]+))?\s*\)/);
		if (m) {
			return {
			rgb: [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)],
			alpha: m[4] !== undefined ? parseFloat(m[4]) : 1
			};
		}
		return null;
	} catch {
		return null;
	}
}

function clamp(v, a = 0, b = 1) { 
  return Math.min(b, Math.max(a, v)); 
}

function rgbToHsl([r, g, b]) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h = 0, s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h *= 60;
	}
	return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHex([r, g, b]) {
	return (
		'#' +
		[r, g, b]
		.map((n) => {
			const s = Math.round(n).toString(16);
			return s.length === 1 ? '0' + s : s;
		})
		.join('')
	).toLowerCase();
}

function hasText(el) {
    if (!el) return false;

    if (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement) {
        return Boolean(el.value?.trim());
    }

    const text = el.textContent;
    if (!text) return false;

    return text.trim().length > 0;
}

function hasSurface(el, computed, area) {
    if (area < 500) return false;

    if (hasVisibleBackground(computed)) return true;
    if (hasBackgroundImage(computed)) return true;

    return false;
}

function hasVisibleBackground(computed) {
    const bg = computed.backgroundColor;
    return bg &&
        bg !== 'transparent' &&
        bg !== 'rgba(0, 0, 0, 0)';
}

function hasBackgroundImage(computed) {
    return computed.backgroundImage &&
           computed.backgroundImage !== 'none';
}