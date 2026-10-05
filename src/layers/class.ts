import { DEFAULT_ZOOM_LEVELS } from "../config/defaults";
import { type Bounds, type Feature, type LabelQueueEntry, type StyleRule, type ZoomLevel } from "../types";
import { LabelHandler } from "../labels/classes";
import { zoomLevelIndex } from "./utils";
import { appendToPath } from "../geometry";
import { Style } from "../styles/class";
import { resolveStyle } from "../styles/utils";
import { boundsContainsPoint, lonLatToMercator } from "../math";

export class Layer {
    name: string;
    features: Feature[];
    styleRules: StyleRule[];
    labelHandler: LabelHandler | null;
    zoomLevels: ZoomLevel[];
    debug: boolean;
    dependentOnLabels: boolean;
    ready: boolean;

    constructor(
        name: string,
        styleRules: StyleRule[],
        labelHandler: LabelHandler | null = null,
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS,
        dependentOnLabels: boolean = false,
        debug: boolean = false,
    ) {
        this.name = name;
        this.features = [];
        this.styleRules = styleRules;
        this.labelHandler = labelHandler;
        this.zoomLevels = zoomLevels;
        this.dependentOnLabels = dependentOnLabels;
        this.debug = debug;
        this.ready = false;
    }

    async load(ctx: CanvasRenderingContext2D): Promise<void> { }

    render(ctx: CanvasRenderingContext2D, visibleBounds: Bounds, scale: number, webMercScale: number, labelQueue: LabelQueueEntry[]): void {
        const buckets = new Map<Style, Path2D>();

        const zoomIndex = zoomLevelIndex(webMercScale, this.zoomLevels);

        for (const feature of this.features) {
            if (feature.properties.MIN_ZOOM >= webMercScale) continue;
            const geometry = feature.builtGeometry;
            if (geometry) {
                const style = resolveStyle(this.styleRules, feature.properties, webMercScale);
                if (!style) continue;

                let path = buckets.get(style);

                if (!path) {
                    path = new Path2D();
                    buckets.set(style, path);
                }

                if (style.enabled.fill || style.enabled.stroke) {
                    appendToPath(path, geometry, visibleBounds, zoomIndex, feature.geometry.type);
                }
            }

            if (this.labelHandler == null || feature.properties.MIN_LABEL >= webMercScale || feature.properties.MAX_LABEL <= webMercScale || !boundsContainsPoint(visibleBounds, lonLatToMercator(feature.properties.LABEL_POINT))) continue;

            boundsContainsPoint(visibleBounds, feature.properties.LABEL_POINT)
            const index = this.labelHandler.resolveIndex(feature.properties, webMercScale);
            const styleIdx = this.labelHandler.resolveStyleIndex(feature.properties, webMercScale);
            if (index == null || styleIdx == null) continue;
            labelQueue.push(feature.properties.LABEL_ENTRIES[styleIdx][index]);

        }

        if (!this.ready) return;


        for (const [style, path] of buckets) {
            style.apply(ctx, scale);
            if (style.enabled.fill) ctx.fill(path, 'evenodd');
            if (style.enabled.stroke) ctx.stroke(path);
        }
    }

}