import { layerKey } from "../../caching/key";
import { cacheGet, cacheSet } from "../../caching/store";
import { DEFAULT_ZOOM_LEVELS } from "../../config/defaults";
import { packGeometry, unpackGeometry } from "../../geometry/registry";
import { LabelHandler } from "../../labels/classes";
import { type PackedFeature, type StyleRule, type ZoomLevel } from "../../types";
import { Layer } from "../class";

export class StaticLayer extends Layer {
    coordinates: { type: string, coordinates: any }[];
    constructor(
        name: string,
        coordinates: { type: string, coordinates: any }[],
        styleRules: StyleRule[],
        labelHandler: LabelHandler | null = null,
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS,
        dependentOnLabels: boolean = false,
        debug: boolean = false,
    ) {
        super(name, styleRules, labelHandler, zoomLevels, dependentOnLabels, debug);
        this.coordinates = coordinates;
    }

    async load(): Promise<void> {
        const key = await layerKey(this.name, JSON.stringify(this.coordinates), this.zoomLevels);

        let cached = await cacheGet<PackedFeature[]>(key);
        if (!cached) {
            cached = this.coordinates.map(c => ({
                type: c.type,
                packed: packGeometry({ type: c.type, coordinates: c.coordinates }, this.zoomLevels),
            }));
            await cacheSet(key, cached);
        }

        this.features = this.coordinates.map((coords, i) => ({
            properties: { 'null': null },
            geometry: coords,
            builtGeometry: cached![i].packed == null
                ? null
                : unpackGeometry(cached![i].type, cached![i].packed),
        }));
        this.ready = true;
    }
}