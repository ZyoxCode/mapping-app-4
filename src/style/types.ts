import type { Style } from "./classes";

export interface StyleOptions {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    textAlign?: CanvasTextAlign;
    font?: string;
    dashed?: number[];
}

export interface StyleRule<P = Record<string, any>> {
    when(properties: P, webMercZoom: number): boolean;
    style: Style;
}