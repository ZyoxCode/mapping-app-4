import { DEFAULT_ZOOM_LEVELS } from "../../config/defaults";
import { prepareGeometry } from "../../geometry";
import { LabelHandler } from "../../labels/classes";
import { type StyleRule, type ZoomLevel } from "../../types";
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

    async load(ctx: CanvasRenderingContext2D): Promise<void> {
        this.features = this.coordinates.map((coords) => {
            const prepared = prepareGeometry({ type: coords.type, coordinates: coords.coordinates }, this.zoomLevels);
            return {
                properties: { 'null': null },
                geometry: coords,
                builtGeometry: prepared
            };
        })
        this.ready = true;

    }
}