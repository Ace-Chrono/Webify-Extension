import { zapState } from "./state";

export function zap() {
    zapState.setZapMode(!zapState.getZapMode());
    if (zapState.getZapMode()) {
        document.addEventListener('mouseover', highlightElement);
        document.addEventListener('mouseout', removeHighlight);
        document.addEventListener('click', zapElement);
    } else {
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('mouseout', removeHighlight);
        document.removeEventListener('click', zapElement);
    }
}

function zapElement(event) {
    if (zapState.getZapMode()) {
        removeHighlight(event);
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('mouseout', removeHighlight);
        document.removeEventListener('click', zapElement);
        zapState.setZapMode(false);
        zapState.addElement({ element: event.target, displayStyle: event.target.style.display});

        /*
        let identifier;
        if (event.target.id) {
            identifier = `ID: ${event.target.id}`;
        } else if (event.target.className) {
            identifier = `Class: ${event.target.className}`;
        } else {
            identifier = `Tag: ${event.target.tagName}`;
        }
        zapState.addID(identifier);
        */

        const selector = getSelector(event.target);
        zapState.addID({
            selector,
            label: selector.startsWith('#')
                ? selector
                : event.target.tagName.toLowerCase(), 
            fallback: {
                tag: event.target.tagName,
                classes: [...event.target.classList],
                text: event.target.textContent?.trim().slice(0, 50)
            }
        });
        event.target.style.display = 'none';
    }
}

function highlightElement(event) {
    if (zapState.getZapMode()) {
        const lastEl = zapState.getLastHighlighted();
        const originalStyle = zapState.getOriginalStyle();

        if (lastEl && originalStyle) {
            lastEl.style.outline = originalStyle.outline;
            lastEl.style.cursor = originalStyle.cursor;
        }

        zapState.setLastHighlighted(event.target);
        zapState.setOriginalStyle({
            outline: event.target.style.outline,
            cursor: event.target.style.cursor
        });

        event.target.style.outline = '2px solid red';
        event.target.style.cursor = 'pointer';

    }
}

function removeHighlight() {
    if (zapState.getZapMode() && zapState.getLastHighlighted()) {
        const lastEl = zapState.getLastHighlighted();
        const originalStyle = zapState.getOriginalStyle();
        lastEl.style.outline = originalStyle.outline;
        lastEl.style.cursor = originalStyle.cursor;
        zapState.setLastHighlighted(null);
    }
}

function getSelector(el) {
    if (el.id) {
        return `#${CSS.escape(el.id)}`;
    }

    const parts = [];

    while (el && el.nodeType === Node.ELEMENT_NODE) {
        let part = el.tagName.toLowerCase();

        if (el.classList.length) {
            part += '.' + [...el.classList]
                .map(c => CSS.escape(c))
                .join('.');
        }

        const parent = el.parentElement;
        if (parent) {
            const index =
                [...parent.children].indexOf(el) + 1;
            part += `:nth-child(${index})`;
        }

        parts.unshift(part);
        el = el.parentElement;
    }

    return parts.join(' > ');
}