import type { ZoomLevel } from "./layers/zoom-levels";
import type { StyleOptions } from "./styles/types";

export const DEFAULT_STYLE_OPTIONS: StyleOptions = {
    fillColor: null,
    strokeColor: null,
    strokeWidth: null,
    textAlign: 'center',
    font: null,
    dashed: [],
    pointRadii: [],
}

export const DEFAULT_ZOOM_LEVELS: ZoomLevel[] = [

    { upperZoomBound: Infinity, areaThreshold: 0 },
    { upperZoomBound: 8, areaThreshold: 0.001 },
    { upperZoomBound: 7, areaThreshold: 0.003 },
    { upperZoomBound: 6, areaThreshold: 0.01 },
    { upperZoomBound: 5, areaThreshold: 0.03 },
    { upperZoomBound: 4, areaThreshold: 0.1 },
    { upperZoomBound: 3, areaThreshold: 0.35 },
    { upperZoomBound: 2, areaThreshold: 0.7 },

];