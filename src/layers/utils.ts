import { type ZoomLevel } from "../types";

export function zoomLevelIndex(webMercZoom: number, levels: ZoomLevel[]): number {
    const index = levels.findLastIndex(level => webMercZoom <= level.upperZoomBound);
    return index === -1 ? levels.length - 1 : index;
}

export function unifyProperties(properties: Record<string, any> | null, geometry: any) {
    if (!properties) return;

    if (properties.featurecla != null) {
        properties.FEATURECLA = properties.featurecla;
        delete properties.featurecla;
    }

    if (properties.scalerank != null) {
        properties.SCALERANK = properties.scalerank;
        delete properties.scalerank;
    }

    if (properties.labelrank != null) {
        properties.LABELRANK = properties.labelrank;
        delete properties.labelrank;
    }

    if (properties.min_zoom != null) {
        properties.MIN_ZOOM = properties.min_zoom;
        delete properties.min_zoom;
    }

    if (properties.min_label != null) {
        properties.MIN_LABEL = properties.min_label;
        delete properties.min_label;
    }

    if (properties.max_label != null) {
        properties.MAX_LABEL = properties.max_label;
        delete properties.max_label;
    }

    if (properties.name != null) {
        properties.NAME = properties.name;
        delete properties.name;
    }

    if (properties.name_en != null) {
        properties.NAME_EN = properties.name_en;
        delete properties.name_en;
    }

    if (properties.LABEL_X == undefined && properties.LABEL_Y == undefined) {
        properties.LABEL_X = null;
        properties.LABEL_Y = null;
    }
    if (properties.latitude != null && properties.longitude != null) {
        properties.LABEL_X = properties.longitude;
        properties.LABEL_Y = properties.latitude;
    }

    properties.LABEL_POINT = [properties.LABEL_X, properties.LABEL_Y];
    delete properties.LABEL_X;
    delete properties.LABEL_Y;

    if (geometry) {
        if (geometry.type == 'Point') {
            properties.LABEL_POINT = geometry.coordinates;
        }
    }


    if (properties.MIN_ZOOM == null) {
        properties.MIN_ZOOM = 0;
    }

    if (properties.MIN_LABEL == null) {
        properties.MIN_LABEL = 0;
    }

    if (properties.MAX_LABEL == null) {
        properties.MAX_LABEL = Infinity;
    }

}