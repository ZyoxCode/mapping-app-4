import { boundsIntersect, computeCoordsBounds, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import { removeDuplicateEnds, ringToPath, type BuiltMultiPolygon, type MultiPolygon } from "./utils";
import type {Bounds} from "../../math";

export interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: MultiPolygon;
}

registerGeometry<MultiPolygonGeometry, BuiltMultiPolygon>('MultiPolygon', {
    prepare(geometry) {
        const path = new Path2D();
        let bbox = {minCorner: {x: 0, y: 0}, maxCorner: {x: 0, y: 0}} as Bounds;

        geometry.coordinates.forEach((polygon, i) => {
            polygon.forEach((ring, j) => {
                removeDuplicateEnds(ring);
                if (j == 0) bbox = unionBounds([bbox, computeCoordsBounds(ring)]);
                path.addPath(ringToPath(ring, true));
            });
        });

        return {type: geometry.type, bbox: bbox, path: path};
    },
    appendToPath(mergedPath, prepared, visibleBounds) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) {return;}
        mergedPath.addPath(prepared.path);
    }
})