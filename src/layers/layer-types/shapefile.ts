import { DEFAULT_ZOOM_LEVELS } from "../../config/defaults";
import { toAbsoluteUrl, pathExists } from "../../file/utils";
import { prepareGeometry } from "../../geometry";
import { LabelHandler } from "../../labels/classes";
import { type StyleRule, type ZoomLevel } from "../../types";
import { Layer } from "../class";
import { unifyProperties } from "../utils";

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
        labelHandler: LabelHandler | null = null,
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS,
        dependentOnLabels: boolean = false,
        debug: boolean = false,
    ) {
        super(name, styleRules, labelHandler, zoomLevels, dependentOnLabels, debug);
        this.filePath = filePath;
    }

    async load(ctx: CanvasRenderingContext2D): Promise<void> {
        const geojson = await loadShapefile(this.filePath, this.debug);
        if (this.debug) {
            console.log("[DEBUG]", this.name, "geojson:", geojson);
        }
        this.features = geojson.features.map((feature) => {
            if (!feature.geometry) {
                return { properties: feature.properties, geometry: null, builtGeometry: null };
            }
            unifyProperties(feature.properties, feature.geometry);
            const prepared = prepareGeometry(feature.geometry, this.zoomLevels);

            feature.properties.LABEL_ENTRIES = (this.labelHandler) ? this.labelHandler.buildLabels(feature.properties, ctx) : [];
            return { properties: feature.properties, geometry: feature.geometry, builtGeometry: prepared };
        })

        if (this.debug) {
            console.log("[DEBUG]", this.name, "features:", this.features);
        }

        this.ready = true;
    }
}