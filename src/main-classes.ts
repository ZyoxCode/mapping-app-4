import type { Layer } from "./layers/layer";
import { type Bounds, type Point } from "./math/types";
import { scaleToWebMercatorZoom } from "./math/utils";

class Viewport {
    offset: Point;
    last: Point;
    scale: number;
    isDragging: boolean;

    constructor() {
        this.offset = {x: 0, y: 0};
        this.last = { x: 0, y: 0 };
        this.scale = 1;
        this.isDragging = false;
    }
}

export class GeoMap {

    viewport: Viewport;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    layers: Layer[];

    constructor(canvas: HTMLCanvasElement, layers: Layer[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.viewport = new Viewport();
        this.layers = layers;
        
        for (const layer of layers) {
            layer.load();
        }
    }

    getVisibleBounds(scale: number, translateX: number, translateY: number): Bounds {
        const xMin = (0 - (translateX)) / scale;
        const xMax = (this.canvas.width - (translateX)) / scale;
        
        const yMax = -(0 - (translateY)) / scale;
        const yMin = -(this.canvas.height - (translateY)) / scale;

        return {minCorner: {x: xMin, y: yMin}, maxCorner: {x: xMax, y: yMax}};
    }
    
    render() {
        if (!this.ctx) return;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#2d2e38';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.layers == null) {return;}

        const R = this.canvas.height / (2 * Math.PI);
        const scale = R * this.viewport.scale;
        const webMercScale = scaleToWebMercatorZoom(2 * Math.PI * scale);
        const translateX = this.canvas.width / 2 + this.viewport.offset.x;
        const translateY = this.canvas.height / 2 + this.viewport.offset.y;
        const visibleBounds = this.getVisibleBounds(scale, translateX, translateY);

        this.ctx.setTransform(scale, 0, 0, -scale, translateX, translateY);


        this.ctx.fillStyle = '#000000'
        for (const layer of this.layers) {
            layer.render(this.ctx, visibleBounds, scale);
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}