import { DEFAULT_STYLE_OPTIONS } from "../config/defaults";
import { type StyleOptions } from "../types/styles";

export class Style {
    styleOptions: Required<StyleOptions>;
    enabled: Record<string, boolean>;

    constructor(styleOptions: StyleOptions) {
        this.styleOptions = { ...DEFAULT_STYLE_OPTIONS, ...styleOptions };

        this.enabled = { 'fill': true, 'stroke': true, 'label': true };
        if (!this.styleOptions.fillColor) this.enabled.fill = false;
        if (!this.styleOptions.strokeColor) this.enabled.stroke = false;
        if (!this.styleOptions.font) this.enabled.label = false;
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