import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry.ts";
import { buildRing, RingSimplifier } from "../utils/simplification.ts";
import { type ZoomLevel, type BuiltLineString, type Point } from "../../types";
import { ringToPath } from "../utils/general.ts";
import { stats } from "./multipolygon.ts";

export interface LineStringGeometry {
    type: 'LineString';
    coordinates: Point[];
}

export function buildLineString(coordinates: Point[], zoomLevels: ZoomLevel[]) {
    const pathPerZoom = new Map<number, Path2D>();
    const bbox = computeCoordsBounds(coordinates);

    let simplifier = new RingSimplifier(buildRing(coordinates, false), false);

    for (const [index, zoomLevel] of zoomLevels.entries()) {
        const path = new Path2D();

        if (zoomLevel.areaThreshold != 0) simplifier.simplify(zoomLevel.areaThreshold);
        const snapshot = simplifier.snapshot();


        if (snapshot.length < 2) {
            break;
        }
        path.addPath(ringToPath(snapshot));
        pathPerZoom.set(index, path);
    }

    return { bbox, pathPerZoom };

}

registerGeometry<LineStringGeometry, BuiltLineString>('LineString', {
    prepare(geometry, zoomLevels) {
        return buildLineString(geometry.coordinates, zoomLevels);
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) return;

        const path = prepared.pathPerZoom.get(zoomIndex);
        if (!path) return;
        mergedPath.addPath(path);

        stats.calls++;
    },
})