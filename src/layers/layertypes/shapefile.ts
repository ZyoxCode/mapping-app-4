import { toAbsoluteUrl, pathExists } from "../../file/utils";
import { prepareGeometry } from "../../geometry";
import { Layer } from "../layer";
import { type ZoomLevel } from "../zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../../defaults";
import type { StyleRule } from "../../styles";
import type { LabelRule } from "../../labels/types";
import { lonLatToMercator } from "../../math";



export interface GeoJSONFeature {
    type: 'Feature';
    properties: Record<string, any>;
    geometry: { type: string; coordinates: any };
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

declare function shp(url: string): Promise<GeoJSONFeatureCollection | GeoJSONFeatureCollection[]>;

const shapefileCache = new Map<string, GeoJSONFeatureCollection>();

export async function loadShapefile(name: string): Promise<GeoJSONFeatureCollection> {
    const cached = shapefileCache.get(name);
    if (cached) return cached;
    console.log(toAbsoluteUrl(`./data/${name}/${name}`));
    const unzippedShp = toAbsoluteUrl(`./data/${name}/${name}.shp`);
    const data = (await pathExists(unzippedShp))
        ? await shp(toAbsoluteUrl(`./data/${name}/${name}`))
        : await shp(`./data/${name}.zip`);

    const geojson = Array.isArray(data) ? data[0] : data;
    shapefileCache.set(name, geojson);
    return geojson;

}


export class ShapefileLayer extends Layer {
    filePath: string;

    constructor(
        name: string,
        filePath: string,
        styleRules: StyleRule[],
        labelRules: LabelRule[] = [],
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS,
        debug: boolean = false
    ) {
        super(name, styleRules, labelRules, zoomLevels, debug);
        this.filePath = filePath;
    }

    async load(): Promise<void> {
        const geojson = await loadShapefile(this.filePath);
        this.features = geojson.features.map((feature) => {
            const prepared = prepareGeometry(feature.geometry, this.zoomLevels);
            let labelCoords = null;
            if (this.labelRules.length > 0) {
                if (feature.properties.LABEL_X != null) {
                    labelCoords = lonLatToMercator({ x: feature.properties.LABEL_X, y: feature.properties.LABEL_Y });
                }
            }
            return { ...feature, geometryByZoom: prepared, rawGeometry: feature.geometry, labelCoords: labelCoords };
        }).filter((feature) => feature.geometryByZoom !== null) as any;

        if (this.debug) {
            console.log(this.features);
        }

        this.ready = true;
    }
}

