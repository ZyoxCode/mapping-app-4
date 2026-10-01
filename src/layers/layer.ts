import type { Feature } from "../geometry/types";
import { appendToPath, prepareGeometry} from "../geometry";

export class Layer {
    name: string;
    features: Feature[];
    ready: boolean;

    constructor(name: string, features: Feature[]) {
        this.name = name;
        this.features = features;
        this.ready = false;
    }

    async load(): Promise<void> {}

    render(ctx: CanvasRenderingContext2D) {
        for (const feature of this.features) {
            ctx.fill(feature.path);
            ctx.stroke(feature.path);
        }
    }
}


export class StaticLayer extends Layer {
    coordinates: number[][][][];
    geometryType: string;
    constructor(name: string, coordinates: number[][][][], geometryType: string) {
        super(name, []);
        this.coordinates = coordinates;
        this.geometryType = geometryType;
    }

    async load(): Promise<void> {
        
        this.features = this.coordinates.flatMap((coords) => {
            const prepared = prepareGeometry({ type: this.geometryType, coordinates: coords })
            if (!prepared) return [];
            return [{
                bbox: prepared.bbox,
                path: prepared.path,
                properties: {},
            }];
        });

        this.ready = true;
    }

    render(ctx: CanvasRenderingContext2D) {
        const path = new Path2D();
        for (const feature of this.features) {
            path.addPath(feature.path);
        }

        if (!this.ready) return;
        
        ctx.fill(path);
        ctx.stroke(path);
    }
}

export class DynamicLayer extends Layer {
    constructor(name: string, features: Feature[]) {
        super(name, features);
    }

    async load(): Promise<void> {
        // TODO: Load the layer from a file or some other source
    }
}