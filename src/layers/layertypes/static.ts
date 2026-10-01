import { prepareGeometry } from "../../geometry";
import { Style } from "../../style/classes";
import { Layer } from "../layer";
import { type ZoomLevel } from "../zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "../../defaults";

export class StaticLayer extends Layer {
    coordinates: number[][][][];
    geometryType: string;
    constructor(
        name: string, 
        coordinates: number[][][][], 
        geometryType: string, 
        style: Style = new Style({}), 
        zoomLevels: ZoomLevel[] = DEFAULT_ZOOM_LEVELS, 
        debug: boolean = false
    ) {
        super(name, style, zoomLevels, debug);
        this.coordinates = coordinates;
        this.geometryType = geometryType;
    }

    async load(): Promise<void> {
        this.features.map((coords) => {
            const prepared = prepareGeometry({ type: this.geometryType, coordinates: coords }, this.zoomLevels);
            if (!prepared) return [];
            return {
                geometryByZoom: prepared,
                properties: {},
            };
        });
        this.ready = true;
    }
}