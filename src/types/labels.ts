import { Style } from "../styles/class";
import type { ScreenBox } from "./canvas";
import { type Point } from "./geometry";

export interface Marker {
    radii: number[];
    gap: number;
}

export interface LabelQueueEntry {
    lines: string[];
    screenBox: ScreenBox
    offsetX: number;
    lineHeight: number;
    coords: Point;
    style: Style;
    marker: Marker | null;
    scaleRank: number;
    labelRank: number;
}

export type showFnType = (properties: Record<string, any>, zoomLevel: number) => boolean
export type buildFnType = (properties: Record<string, any>) => string
export type selectFnType = (properties: Record<string, any>, zoomLevel: number) => number
