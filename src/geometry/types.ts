import type { Bounds } from "../math/types";

export interface Feature {
    bbox: Bounds;
    path: Path2D;
    properties: Record<string, any> | null;
}

export interface PreparedGeometry {
    type: string;
    bbox: Bounds;
    path: Path2D;
}

export interface GeometryHandler<GeometryType, PreparedGeometryType extends PreparedGeometry> {
    prepare(geometry: GeometryType): PreparedGeometryType | null;
    appendToPath(path: Path2D, prepared: PreparedGeometryType, visibleBounds: Bounds): void;
}


