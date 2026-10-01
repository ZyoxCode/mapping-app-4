import type { ZoomLevel } from "../layers/zoom-levels";
import type { Bounds } from "../math";


export interface GeometryPerZoom<BuiltType = any> {
    type: string;
    bbox: Bounds;
    builtPerZoom: Map<number, BuiltType>;
    
}

export interface GeometryHandler<GeometryType, BuiltType = any> {
    prepare(geometry: GeometryType, zoomLevels: ZoomLevel[]): GeometryPerZoom<BuiltType> | null;
    appendToPath(path: Path2D, prepared: GeometryPerZoom<BuiltType>, visibleBounds: Bounds, zoomIndex: number): void;
}


