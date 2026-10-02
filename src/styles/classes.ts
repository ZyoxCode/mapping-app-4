import { DEFAULT_STYLE_OPTIONS } from "../defaults";
import type { StyleOptions } from "./types";

export class Style {
    styleOptions: StyleOptions;
    fill: boolean;
    stroke: boolean;

    constructor(styleOptions: StyleOptions, fill: boolean = true, stroke: boolean = false) {
        this.styleOptions = { ...DEFAULT_STYLE_OPTIONS, ...styleOptions };
        this.fill = fill;
        this.stroke = stroke;
    }

    apply(ctx: CanvasRenderingContext2D, scale: number): void {
        const { fillColor, strokeColor, strokeWidth, textAlign, font, dashed } = this.styleOptions;
        if (fillColor != null) ctx.fillStyle = fillColor;
        if (strokeColor != null) ctx.strokeStyle = strokeColor;
        if (strokeWidth != null) ctx.lineWidth = strokeWidth == 0 ? 0 : strokeWidth / scale;
        if (textAlign != null) ctx.textAlign = textAlign;
        if (font != null) ctx.font = font;
        if (dashed != null) ctx.setLineDash(dashed.map(d => d / scale));
    }
}