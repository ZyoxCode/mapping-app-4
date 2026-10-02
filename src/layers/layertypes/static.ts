import { prepareGeometry } from "../../geometry";
import { Layer } from "../layer";
import { type ZoomLevel } from "../zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../../defaults";
import type { StyleRule } from "../../styles";
import type { LabelRule } from "../../labels/types";

export class StaticLayer extends Layer {
    coordinates: { type: string, coordinates: any }[];
    constructor(
        name: string,
        coordinates: { type: string, coordinates: any }[],
        styleRules: StyleRule[],
        labelRules: LabelRule[] = [],
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS,
        debug: boolean = false
    ) {
        super(name, styleRules, labelRules, zoomLevels, debug);
        this.coordinates = coordinates;
    }

    async load(): Promise<void> {
        this.features = this.coordinates.map((coords) => {
            const prepared = prepareGeometry({ type: coords.type, coordinates: coords.coordinates }, this.zoomLevels);
            if (!prepared) return {};
            return {
                geometryByZoom: prepared,
                properties: {},
                rawGeometry: coords,
                labelCoords: null,
            };
        }).filter((feature) => feature.geometryByZoom !== null) as any;
        this.ready = true;

    }
}