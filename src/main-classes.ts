import { renderLabelQueue } from "./labels/queue";
import { Layer } from "./layers/class";
import { scaleToWebMercatorZoom } from "./math";
import { type Point, type LabelQueueEntry, type Bounds } from "./types";
import { stats } from "./geometry/type-handlers/multipolygon";

class Viewport {
    offset: Point;
    last: Point;
    scale: number;
    isDragging: boolean;

    constructor() {
        this.offset = [0, 0];
        this.last = [0, 0];
        this.scale = 1;
        this.isDragging = false;
    }
}

export class GeoMap {

    viewport: Viewport;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    layers: Layer[];
    labelQueue: LabelQueueEntry[];

    constructor(canvas: HTMLCanvasElement, layers: Layer[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.viewport = new Viewport();
        this.labelQueue = [];
        this.layers = layers;

        if (this.ctx) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        for (const layer of layers) {
            if (this.ctx) layer.load(this.ctx);
        }
    }

    getVisibleBounds(scale: number, translateX: number, translateY: number): Bounds {
        const xMin = (0 - (translateX)) / scale;
        const xMax = (this.canvas.width - (translateX)) / scale;

        const yMax = -(0 - (translateY)) / scale;
        const yMin = -(this.canvas.height - (translateY)) / scale;

        return [[xMin, yMin], [xMax, yMax]];
    }

    render() {
        this.labelQueue = [];
        if (!this.ctx) return;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#2d2e38';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.layers == null) { return; }

        const R = this.canvas.height / (2 * Math.PI);
        const scale = R * this.viewport.scale;
        const webMercScale = scaleToWebMercatorZoom(2 * Math.PI * scale);
        const translateX = this.canvas.width / 2 + this.viewport.offset[0];
        const translateY = this.canvas.height / 2 + this.viewport.offset[1];
        const visibleBounds = this.getVisibleBounds(scale, translateX, translateY);

        this.ctx.setTransform(scale, 0, 0, -scale, translateX, translateY);
        for (const layer of this.layers) {
            stats.calls = 0;
            layer.render(this.ctx, visibleBounds, scale, webMercScale, this.labelQueue);
            // console.log(layer.name, stats);
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        renderLabelQueue(this.ctx, this.labelQueue, scale, translateX, translateY);
    }
}