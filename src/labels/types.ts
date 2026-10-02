import type { Point } from "../math";
import type { Style } from "../styles";

export interface LabelQueueEntry {
    text: string;
    coords: Point;
    style: Style;
    scaleRank: number;
    labelRank: number;
}

export interface ScreenBox {
    left: number; right: number; top: number; bottom: number;
}

export interface LabelRule<P = Record<string, any>> {
    when(properties: P, webMercZoom: number): boolean;
    text(properties: P, webMercZoom: number): string;
    style: Style;
    priorityOffset?: number;
}
