import type { Style } from "./classes";

export interface StyleOptions {
    fillColor?: string | null;
    strokeColor?: string | null;
    strokeWidth?: number | null;
    textAlign?: CanvasTextAlign | null;
    font?: string | null;
    dashed?: number[] | null;
    pointRadii?: number[];
}

export interface StyleOptionsCertain {
    fillColor: string | null;
    strokeColor: string | null;
    strokeWidth: number | null;
    textAlign: CanvasTextAlign | null;
    font: string | null;
    dashed: number[] | null;
    pointRadii: number[];
}

export interface StyleRule<P = Record<string, any>> {
    when(properties: P, webMercZoom: number): boolean;
    style: Style;
}