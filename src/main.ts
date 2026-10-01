import { resizeCanvas } from "./canvas";
import { StaticLayer } from "./layers/layer";
import { GeoMap } from "./main-classes";

const canvas = document.querySelector('canvas')!;
console.log(canvas);

if (!canvas || canvas == null) {
    throw new Error("No canvas detected");
};

// Pre map intialization setup
resizeCanvas(canvas);


// Map Init
const map = new GeoMap(canvas, [

    new StaticLayer(
        "test",
        [[[[20, 20], [20, -20], [-20, -20], [-20, 20]]]],
        'Polygon'
    )
]);

map.render();

// Event Listeners
window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    map.render();
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const cx = map.canvas.width / 2;
    const cy = map.canvas.height / 2;
  
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
  
    map.viewport.offset.x = dx - (dx - map.viewport.offset.x) * zoomFactor;
    map.viewport.offset.y = dy - (dy - map.viewport.offset.y) * zoomFactor;
    map.viewport.scale *= zoomFactor;

    map.render();

}, { passive: false });
  
canvas.addEventListener('pointerdown', (e) => {
    map.viewport.isDragging = true;
    map.viewport.last = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
});
  
canvas.addEventListener('pointermove', (e) => {
    if (!map.viewport.isDragging) return;
  
    map.viewport.offset.x += e.clientX - map.viewport.last.x;
    map.viewport.offset.y += e.clientY - map.viewport.last.y;
    map.viewport.last = { x: e.clientX, y: e.clientY };

    map.render();
}, { passive: true });
  
function stopDrag(e: PointerEvent): void {
    if (map.viewport.isDragging) {
        map.viewport.isDragging = false;
        canvas.releasePointerCapture(e.pointerId);
    }
}
  
canvas.addEventListener('pointerup', stopDrag);
canvas.addEventListener('pointercancel', stopDrag);