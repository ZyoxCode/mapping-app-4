import type { Feature } from "../layers/types";
import { appendToPath} from "../geometry";
import { Style } from "../style/classes";
import type { Bounds } from "../math/types";
import { zoomLevelIndex, type ZoomLevel } from "./zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../defaults";
import { resolveStyle, type StyleRule } from "../style";

export class Layer {
    name: string;
    features: Feature[];
    ready: boolean;
    styleRules: StyleRule[];
    debug: boolean;
    zoomLevels: ZoomLevel[];

    constructor(name: string, style: StyleRule[], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, debug: boolean = false) {
        this.name = name;
        this.features = [];
        this.styleRules = style;
        this.zoomLevels = zoomLevels;
        this.debug = debug;
        this.ready = false;
    }

    async load(): Promise<void> {}

    render(ctx: CanvasRenderingContext2D, visibleBounds: Bounds, scale: number, webMercScale: number): void {
        const buckets = new Map<Style, Path2D>();

        const zoomIndex = zoomLevelIndex(webMercScale, this.zoomLevels);

        for (const feature of this.features) {
         
            const geometry = feature.geometryByZoom;
            if (!geometry) continue;

            const style = resolveStyle(this.styleRules, feature.properties, webMercScale);
            if (!style) continue;

            let path = buckets.get(style);
            if (!path) {
                path = new Path2D();
                buckets.set(style, path);
            }
            
            appendToPath(path, geometry, visibleBounds, zoomIndex);
        }

        if (!this.ready) return;
        

        for (const [style, path] of buckets) {
            style.apply(ctx, scale);
            if (style.fill) ctx.fill(path);
            if (style.stroke) ctx.stroke(path);
        }
    }
}
