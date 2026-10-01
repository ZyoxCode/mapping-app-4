export interface ZoomLevel {
    upperZoomBound: number;
    areaThreshold: number;
}

export function zoomLevelIndex(webMercZoom: number, levels: ZoomLevel[]): number {
    const index = levels.findLastIndex(level => webMercZoom <= level.upperZoomBound);
    return index === -1 ? levels.length -1 : index;
}