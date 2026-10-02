import type { ZoomLevel } from "../layers/zoom-levels";
import type { Bounds } from "../math/types";
import type { GeometryHandler, GeometryPerZoom } from "./types";

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any>>();

export function registerGeometry<GeometryType, BuiltType = any>(
    type: string, handler: GeometryHandler<GeometryType, BuiltType>
): void {
    geometryHandlerRegistry.set(type, handler);
}

export function prepareGeometry(geometry: { type: string, coordinates: any }, zoomLevels: ZoomLevel[]): GeometryPerZoom | null {
    const prepared = geometryHandlerRegistry.get(geometry.type)?.prepare(geometry as any, zoomLevels) ?? null;
    return prepared != null ? prepared : null;
}

export function appendToPath(path: Path2D, prepared: any, visibleBounds: Bounds, zoomIndex: number): void {
    geometryHandlerRegistry.get(prepared.type)?.appendToPath(path, prepared, visibleBounds, zoomIndex);
}