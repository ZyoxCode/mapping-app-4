import type { Feature } from "../layers/types";
import { appendToPath } from "../geometry";
import { Style } from "../styles/classes";
import type { Bounds } from "../math/types";
import { zoomLevelIndex, type ZoomLevel } from "./zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../defaults";
import { resolveStyle, type StyleRule } from "../styles";
import type { LabelQueueEntry, LabelRule } from "../labels/types";
import { boundsContainsPoint } from "../math";
import { resolveLabelRule } from "../labels/utils";

export class Layer {
    name: string;
    features: Feature[];
    ready: boolean;
    styleRules: StyleRule[];
    labelRules: LabelRule[];
    debug: boolean;
    zoomLevels: ZoomLevel[];

    constructor(name: string, styleRules: StyleRule[], labelRules: LabelRule[], zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, debug: boolean = false) {
        this.name = name;
        this.features = [];
        this.styleRules = styleRules;
        this.labelRules = labelRules;
        this.zoomLevels = zoomLevels;
        this.debug = debug;
        this.ready = false;
    }

    async load(): Promise<void> { }

    render(ctx: CanvasRenderingContext2D, visibleBounds: Bounds, scale: number, webMercScale: number, labelQueue: LabelQueueEntry[]): void {
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
            if (style.enabled.fill || style.enabled.stroke) {
                appendToPath(path, geometry, visibleBounds, zoomIndex);
            }


            if (!feature.labelCoords) continue;
            if (!boundsContainsPoint(visibleBounds, feature.labelCoords)) continue;

            const rule = resolveLabelRule(this.labelRules, feature.properties, webMercScale);

            if (!rule || !feature.properties) continue;

            const scaleRank = (feature.properties.scalerank ?? feature.properties.SCALERANK ?? 0) + (rule.priorityOffset ?? 0)
            labelQueue.push({
                text: rule.text(feature.properties, webMercScale),
                coords: feature.labelCoords,
                style: rule.style,
                scaleRank: scaleRank,
                labelRank: feature.properties.LABELRANK ?? scaleRank,
            });
        }

        if (!this.ready) return;


        for (const [style, path] of buckets) {
            style.apply(ctx, scale);
            if (style.enabled.fill) ctx.fill(path, 'evenodd');
            if (style.enabled.stroke) ctx.stroke(path);
        }
    }
}
