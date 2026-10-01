import { prepareGeometry } from "../../geometry";
import { Style } from "../../style/classes";
import { Layer } from "../layer";

export class StaticLayer extends Layer {
    coordinates: number[][][][];
    geometryType: string;
    constructor(name: string, coordinates: number[][][][], geometryType: string, style: Style = new Style({})) {
        super(name, style);
        this.coordinates = coordinates;
        this.geometryType = geometryType;
    }

    async load(): Promise<void> {
        
        this.features = this.coordinates.flatMap((coords) => {
            const prepared = prepareGeometry({ type: this.geometryType, coordinates: coords })
            if (!prepared) return [];
            return [{
                geometry: prepared,
                properties: {},
            }];
        });

        this.ready = true;
    }
}