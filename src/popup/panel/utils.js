export function getColorAtPosition(x, y, element) {
    const ctx = document.createElement("canvas").getContext("2d");
    const width = ctx.canvas.width = element.offsetWidth;
    const height = ctx.canvas.height = element.offsetHeight;

    ctx.drawImage(element, 0, 0, width, height); 

    // Get the color at the specified position
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex(imageData[0], imageData[1], imageData[2]);
}

export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}