import { boundsIntersect, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import type { BuiltMultiPolygon, Point, BuiltPolygon } from "../../types";
import { buildPolygon } from "./polygon";

export const stats = { calls: 0, points: 0 };

export interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: Point[][][];
}

registerGeometry<MultiPolygonGeometry, BuiltMultiPolygon>('MultiPolygon', {
    prepare(geometry, zoomLevels) {

        const children: BuiltPolygon[] = geometry.coordinates.map(poly => buildPolygon(poly, zoomLevels));
        const bbox = unionBounds(children.map(p => p.bbox));

        return { children, bbox };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        for (const poly of prepared.children) {
            if (!boundsIntersect(poly.bbox, visibleBounds)) continue;

            const path = poly.pathPerZoom.get(zoomIndex);
            if (!path) continue;
            stats.calls++;
            mergedPath.addPath(path);
        }
    }
})