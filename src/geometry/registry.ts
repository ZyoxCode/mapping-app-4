import type { Bounds, ZoomLevel, GeometryHandler } from "../types";

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any>>();

export function registerGeometry<GeometryType, BuiltType = any>(
    type: string, handler: GeometryHandler<GeometryType, BuiltType>
): void {
    geometryHandlerRegistry.set(type, handler);
}

export function prepareGeometry(geometry: { type: string, coordinates: any }, zoomLevels: ZoomLevel[]): any | null {
    const prepared = geometryHandlerRegistry.get(geometry.type)?.prepare(geometry as any, zoomLevels) ?? null;
    return prepared != null ? prepared : null;
}

export function appendToPath(path: Path2D, prepared: any, visibleBounds: Bounds, zoomIndex: number, type: string): void {
    geometryHandlerRegistry.get(type)?.appendToPath(path, prepared, visibleBounds, zoomIndex);
}