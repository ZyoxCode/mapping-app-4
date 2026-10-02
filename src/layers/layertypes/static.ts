import { prepareGeometry } from "../../geometry";
import { Style } from "../../style/classes";
import { Layer } from "../layer";
import { type ZoomLevel } from "../zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../../defaults";
import type { StyleRule } from "../../style";

export class StaticLayer extends Layer {
    coordinates: number[][][][];
    geometryType: string;
    constructor(
        name: string, 
        coordinates: number[][][][], 
        geometryType: string, 
        styleRules: StyleRule[],
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, 
        debug: boolean = false
    ) {
        super(name, styleRules, zoomLevels, debug);
        this.coordinates = coordinates;
        this.geometryType = geometryType;
    }

    async load(): Promise<void> {
        console.log(this.features);
        this.features = this.coordinates.map((coords) => {
            const prepared = prepareGeometry({ type: this.geometryType, coordinates: coords }, this.zoomLevels);
            if (!prepared) return {};
            return {
                geometryByZoom: prepared,
                properties: {},
            };
        }).filter((feature) => feature.geometryByZoom !== null) as any;
        this.ready = true;
    }
}