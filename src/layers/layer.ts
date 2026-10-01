import type { Feature } from "../geometry/types";
import { appendToPath} from "../geometry";
import { Style } from "../style/classes";
import type { Bounds } from "../math/types";

export class Layer {
    name: string;
    features: Feature[];
    ready: boolean;
    style: Style;
    debug: boolean;

    constructor(name: string, style: Style = new Style({}), debug: boolean = false) {
        this.name = name;
        this.features = [];
        this.style = style;
        this.debug = debug;
        this.ready = false;
    }

    async load(): Promise<void> {}

    render(ctx: CanvasRenderingContext2D, visibleBounds: Bounds, scale: number) {
        const path = new Path2D();
        this.style.apply(ctx, scale);

        for (const feature of this.features) {
            appendToPath(path, feature.geometry, visibleBounds);
        }

        if (!this.ready) return;
        

        if (this.style.fill) {
            ctx.fill(path);
        }

        if (this.style.stroke) {
            ctx.stroke(path);
        }
    }
}
