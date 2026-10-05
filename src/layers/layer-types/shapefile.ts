import { layerKey } from "../../caching/key";
import { cacheGet, cacheSet } from "../../caching/store";
import { DEFAULT_ZOOM_LEVELS } from "../../config/defaults";
import { toAbsoluteUrl, pathExists } from "../../file/utils";
import { packGeometry, unpackGeometry } from "../../geometry/registry";
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

interface PackedShapefileFeature {
    properties: Record<string, any>;
    type: string | null;
    packed: any | null;
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

async function dataUrls(name: string): Promise<string[]> {
    const shpUrl = toAbsoluteUrl(`./data/${name}/${name}.shp`);
    if (await pathExists(shpUrl)) {
        return [shpUrl, toAbsoluteUrl(`./data/${name}/${name}.dbf`)];
    }
    return [`./data/${name}.zip`];
}

async function fingerprint(urls: string[]): Promise<string | null> {
    try {
        const parts = await Promise.all(urls.map(async url => {
            const res = await fetch(url, { method: 'HEAD' });
            if (!res.ok) return `${url}:missing`;
            const etag = res.headers.get('etag');
            const modified = res.headers.get('last-modified');
            const length = res.headers.get('content-length');
            if (!etag && !modified && !length) throw new Error('no usable headers');
            return [url, etag, modified, length].join('|');
        }));
        return parts.join(';');
    } catch {
        return null;
    }
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
        const fp = await fingerprint(await dataUrls(this.filePath));
        const key = fp != null ? await layerKey(this.name, fp, this.zoomLevels) : null;

        let packed = key != null
            ? await cacheGet<PackedShapefileFeature[]>(key).catch(() => undefined)
            : undefined;

        if (!packed) {
            const geojson = await loadShapefile(this.filePath, this.debug);
            if (this.debug) {
                console.log("[DEBUG]", this.name, "geojson:", geojson);
            }
            packed = geojson.features.map((feature): PackedShapefileFeature => {
                if (!feature.geometry) {
                    return { properties: feature.properties, type: null, packed: null };
                }
                unifyProperties(feature.properties, feature.geometry);
                return {
                    properties: feature.properties,
                    type: feature.geometry.type,
                    packed: packGeometry(feature.geometry, this.zoomLevels),
                };
            });
            if (key != null) await cacheSet(key, packed).catch(() => { });
        }

        this.features = packed.map((p) => {
            if (p.type == null) {
                return { properties: p.properties, geometry: null, builtGeometry: null };
            }
            p.properties.LABEL_ENTRIES = this.labelHandler
                ? this.labelHandler.buildLabels(p.properties, ctx)
                : [];
            return {
                properties: p.properties,
                geometry: { type: p.type },
                builtGeometry: p.packed == null ? null : unpackGeometry(p.type, p.packed),
            };
        });

        if (this.debug) {
            console.log("[DEBUG]", this.name, "features:", this.features);
        }

        this.ready = true;
    }
}