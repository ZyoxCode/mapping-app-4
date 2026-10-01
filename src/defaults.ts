import type { ZoomLevel } from "./layers/zoom-levels";
import type { StyleOptions } from "./style/types";

export const DEFAULT_STYLE_OPTIONS: StyleOptions = {
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 1,
    textAlign: 'center',
    font: '11px sans-serif',
    dashed: [],
}

export const DEFAULT_ZOOM_LEVELS: ZoomLevel[] = [
    
    { upperZoomBound: Infinity, areaThreshold: 0 },
    { upperZoomBound: 2, areaThreshold: 2 },

];