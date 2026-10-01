import type { Feature } from "../layers/types";
import { appendToPath} from "../geometry";
import { Style } from "../style/classes";
import type { Bounds } from "../math/types";
import { zoomLevelIndex, type ZoomLevel } from "./zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../defaults";

export class Layer {
    name: string;
    features: Feature[];
    ready: boolean;
    style: Style;
    debug: boolean;
    zoomLevels: ZoomLevel[];

    constructor(name: string, style: Style = new Style({}), zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, debug: boolean = false) {
        this.name = name;
        this.features = [];
        this.style = style;
        this.zoomLevels = zoomLevels;
        this.debug = debug;
        this.ready = false;
    }

    async load(): Promise<void> {}

    render(ctx: CanvasRenderingContext2D, visibleBounds: Bounds, scale: number, webMercScale: number): void {
        const path = new Path2D();
        this.style.apply(ctx, scale);

        const zoomIndex = zoomLevelIndex(webMercScale, this.zoomLevels);

        for (const feature of this.features) {
         
            const geometry = feature.geometryByZoom;
            if (!geometry) continue;
            appendToPath(path, geometry, visibleBounds, zoomIndex);
        }

        if (!this.ready) return;
        

        if (this.style.fill) {
            ctx.fill(path);
        }

        if (this.style.stroke) {
            ctx.stroke(path);
        }
    }
}
