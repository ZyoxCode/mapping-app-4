import type { Bounds } from "../math/types";
import type { GeometryHandler, PreparedGeometry } from "./types";

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any>>();

export function registerGeometry<GeometryType, PreparedGeometryType extends PreparedGeometry>(
    type: string, handler: GeometryHandler<GeometryType, PreparedGeometryType>
): void {
    geometryHandlerRegistry.set(type, handler);
}

export function prepareGeometry(geometry: {type: string, coordinates: any}): PreparedGeometry | null {
    const prepared = geometryHandlerRegistry.get(geometry.type)?.prepare(geometry as any) ?? null;
    return prepared != null ? prepared : null;
}

export function appendToPath(path: Path2D, type: string, processed: PreparedGeometry, visibleBounds: Bounds): void {
    geometryHandlerRegistry.get(type)?.appendToPath(path, processed, visibleBounds);
}