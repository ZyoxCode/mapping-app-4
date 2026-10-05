import type { Bounds, ZoomLevel, GeometryHandler } from "../types";

const geometryHandlerRegistry = new Map<string, GeometryHandler<any, any, any>>();

export function registerGeometry<GeometryType, PackedType = any, BuiltType = any>(
    type: string, handler: GeometryHandler<GeometryType, PackedType, BuiltType>
): void {
    geometryHandlerRegistry.set(type, handler);
}

export function prepareGeometry(geometry: { type: string, coordinates: any }, zoomLevels: ZoomLevel[]): any | null {
    const prepared = geometryHandlerRegistry.get(geometry.type)?.prepare?.(geometry as any, zoomLevels) ?? null;
    return prepared != null ? prepared : null;
}

export function appendToPath(path: Path2D, prepared: any, visibleBounds: Bounds, zoomIndex: number, type: string): void {
    geometryHandlerRegistry.get(type)?.appendToPath(path, prepared, visibleBounds, zoomIndex);
}

export function packGeometry(geometry: { type: string, coordinates: any }, zoomLevels: ZoomLevel[]): any | null {
    return geometryHandlerRegistry.get(geometry.type)?.pack?.(geometry as any, zoomLevels) ?? null;
}

export function unpackGeometry(type: string, packed: any): any | null {
    return geometryHandlerRegistry.get(type)?.unpack?.(packed) ?? null;
}