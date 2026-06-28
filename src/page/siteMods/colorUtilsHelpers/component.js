export function createComponent(root, type = "unknown") {
    return {
        id: crypto.randomUUID(),

        // DOM
        root,
        parent: null,
        children: [],

        // Semantics
        type,
        role: null,

        // Styling
        tokens: {
            surface: null,
            text: null,
            accent: null,
        },

        // Interactive state
        state: {
            hover: false,
            active: false,
            focus: false,
            disabled: false,
        },

        // Classification
        confidence: 0,

        // Cache
        dirty: false,
    };
}