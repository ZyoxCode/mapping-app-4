import { type ZoomLevel } from "./layers";

export type Point = [number, number];
export type Bounds = [Point, Point];

export interface Geometry {
    type: string;
    coordinates: any;
}

export interface BuiltPoint {
    point: Point;
    importance: number;
}

export interface BuiltPolygon {
    bbox: Bounds;
    pathPerZoom: Map<number, Path2D>;
}

export interface BuiltMultiPolygon {
    bbox: Bounds;
    children: BuiltPolygon[];
}

export interface BuiltLineString {
    bbox: Bounds;
    pathPerZoom: Map<number, Path2D>;
}

export interface BuiltMultiLineString {
    bbox: Bounds;
    children: BuiltLineString[];
}

export interface GeometryHandler<GeometryType, PackedType = any, BuiltType = any> {
    prepare?(geometry: GeometryType, zoomLevels: ZoomLevel[]): BuiltType | null;
    pack?(geometry: GeometryType, zoomLevels: ZoomLevel[]): PackedType | null;
    unpack?(packed: PackedType): BuiltType;
    appendToPath(path: Path2D, prepared: BuiltType, visibleBounds: Bounds, zoomIndex: number): void;
}