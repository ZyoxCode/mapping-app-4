import { toAbsoluteUrl, pathExists } from "../../file/utils";
import { prepareGeometry } from "../../geometry";
import { Layer } from "../layer";
import { type ZoomLevel } from "../zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../../defaults";
import type { StyleRule } from "../../styles";
import type { LabelRule } from "../../labels/types";
import { lonLatToMercator } from "../../math";
import { getMultiPolygonCentroid, getPolygonCentroid } from "../../geometry/geomtypes/utils";



export interface GeoJSONFeature {
    type: 'Feature';
    properties: Record<string, any>;
    geometry: { type: string; coordinates: any[] };
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

declare function shp(url: string): Promise<GeoJSONFeatureCollection | GeoJSONFeatureCollection[]>;

const shapefileCache = new Map<string, GeoJSONFeatureCollection>();

export async function loadShapefile(name: string, debug: boolean): Promise<GeoJSONFeatureCollection> {
    const cached = shapefileCache.get(name);
    if (cached) return cached;
    const unzippedShp = toAbsoluteUrl(`./data/${name}/${name}.shp`);
    const data = (await pathExists(unzippedShp))
        ? await shp(toAbsoluteUrl(`./data/${name}/${name}`))
        : await shp(`./data/${name}.zip`);

    const geojson = Array.isArray(data) ? data[0] : data;
    if (debug) console.log("[DEBUG] Loaded", geojson.features.length, "features from", name);
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
        const geojson = await loadShapefile(this.filePath, this.debug);
        if (this.debug) {
            console.log("[DEBUG]", this.name, "geojson:", geojson);
        }
        this.features = geojson.features.map((feature) => {
            const prepared = prepareGeometry(feature.geometry, this.zoomLevels);
            let labelCoords = null;
            if (this.labelRules.length > 0) {
                if (feature.properties.LABEL_X != null) {
                    labelCoords = lonLatToMercator({ x: feature.properties.LABEL_X, y: feature.properties.LABEL_Y });
                } else {
                    if (feature.geometry.type === 'Polygon') {
                        labelCoords = lonLatToMercator(getPolygonCentroid(feature.geometry.coordinates[0]));
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        labelCoords = lonLatToMercator(getMultiPolygonCentroid(feature.geometry.coordinates.map((poly) => poly[0])));
                    } else if (feature.geometry.type === 'Point') {
                        labelCoords = lonLatToMercator({ x: feature.geometry.coordinates[0], y: feature.geometry.coordinates[1] });
                    }
                }
            }
            return { ...feature, geometryByZoom: prepared, rawGeometry: feature.geometry, labelCoords: labelCoords };
        }).filter((feature) => feature.geometryByZoom !== null) as any;

        if (this.debug) {
            console.log("[DEBUG]", this.name, "features:", this.features);
        }

        this.ready = true;
    }
}

