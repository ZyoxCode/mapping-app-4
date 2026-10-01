export function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = window.document.documentElement.clientWidth;
    canvas.height = window.document.documentElement.clientHeight;
}