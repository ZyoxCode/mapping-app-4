
export interface ZoomLevel {
    upperZoomBound: number;
    areaThreshold: number;
}

export interface Feature {
    properties: Record<string, any>;
    geometry: any;
    builtGeometry: any;
}