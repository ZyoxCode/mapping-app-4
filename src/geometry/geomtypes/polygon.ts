import { boundsIntersect, computeCoordsBounds } from "../../math/utils";
import { registerGeometry } from "../registry";
import type { PreparedGeometry } from "../types";
import { ringToPath, type Polygon } from "./utils";

export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: Polygon;
}

registerGeometry<PolygonGeometry, PreparedGeometry>('Polygon', {
    prepare(geometry) {
        const path = new Path2D();
        geometry.coordinates.forEach((ring, i) => {
            path.addPath(ringToPath(ring, true));
        });
       
        const bbox = computeCoordsBounds(geometry.coordinates[0])

        return {type: geometry.type, bbox: bbox, path: path};
    },
    appendToPath(mergedPath, prepared, visibleBounds) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) {return;}
        mergedPath.addPath(prepared.path);
    }
})