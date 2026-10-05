import { lonLatToMercator } from "../math";
import { Style } from "../styles/class";
import type { buildFnType, selectFnType, ScreenBox, LabelQueueEntry, Marker, StyleRule } from "../types";
import { wrapText } from "./utils";
const PADDING = 4;

export class LabelHandler {
    build: buildFnType[];
    selector: selectFnType;
    styleRules: StyleRule[];
    marker: Marker | null;
    priorityOffset: number;
    maxChars: number;
    private styles: Style[];
    private styleIndex = new Map<Style, number>();

    constructor(build: buildFnType[], selector: selectFnType, styleRules: StyleRule[], marker: Marker | null = null, priorityOffset = 0, maxChars = 15) {
        this.build = build;
        this.selector = selector;
        this.styleRules = styleRules;
        this.marker = marker;
        this.priorityOffset = priorityOffset;
        this.maxChars = maxChars;

        this.styles = [...new Set(styleRules.map(r => r.style))];
        this.styles.forEach((s, i) => this.styleIndex.set(s, i));
    }

    /** Result is indexed [styleIndex][buildIndex]. */
    buildLabels(properties: Record<string, any>, ctx: CanvasRenderingContext2D): LabelQueueEntry[][] {
        return this.styles.map(style =>
            this.build.map(buildFn => this.buildEntry(buildFn(properties), style, properties, ctx))
        );
    }

    private buildEntry(text: string, style: Style, properties: Record<string, any>, ctx: CanvasRenderingContext2D): LabelQueueEntry {
        style.apply(ctx, 1); // the font must be set before measuring

        const lines = wrapText(text, this.maxChars);
        const metrics = ctx.measureText(text);
        const textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || 12;

        const widestLine = Math.max(0, ...lines.map(line => ctx.measureText(line).width));
        const halfWidth = widestLine / 2 + PADDING;
        const halfHeight = (textHeight * Math.max(lines.length, 1)) / 2 + PADDING;

        const textOffsetX = this.marker != null ? this.marker.radii[0] + this.marker.gap : 0;
        const alignLeft = style.styleOptions.textAlign == 'left';

        return {
            lines,
            screenBox: {
                left: alignLeft ? textOffsetX : textOffsetX - halfWidth,
                right: alignLeft ? textOffsetX + halfWidth * 2 : textOffsetX + halfWidth,
                top: -halfHeight,
                bottom: halfHeight,
            },
            offsetX: textOffsetX,
            lineHeight: textHeight + PADDING * 0.5,
            coords: lonLatToMercator(properties.LABEL_POINT),
            style,
            marker: this.marker,
            scaleRank: properties.SCALERANK,
            labelRank: properties.LABELRANK + this.priorityOffset,
        };
    }

    resolveIndex(properties: Record<string, any>, webMercZoom: number): number | null {
        return this.selector(properties, webMercZoom);
    }

    resolveStyleIndex(properties: Record<string, any>, webMercZoom: number): number | null {
        const rule = this.styleRules.find(r => r.when(properties, webMercZoom));
        return rule ? this.styleIndex.get(rule.style) ?? null : null;
    }
}