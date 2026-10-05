import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../utils/simplification"
import { type Point, type ZoomLevel, type BuiltPolygon } from "../../types";
import { removeDuplicateEnds, ringToPath } from "../utils/general";
import { stats } from "./multipolygon.ts";

export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: Point[][];
}

export function buildPolygon(coordinates: Point[][], zoomLevels: ZoomLevel[]) {
    const pathPerZoom = new Map<number, Path2D>();
    const bbox = computeCoordsBounds(coordinates[0]) // compute bbox from first ring

    let active = coordinates.map(ring => {
        removeDuplicateEnds(ring);
        return new RingSimplifier(buildRing(ring, true));
    });

    for (const [index, zoomLevel] of zoomLevels.entries()) {
        const path = new Path2D();
        const snapshot: Point[][] = active.map(r => {
            if (zoomLevel.areaThreshold != 0) r.simplify(zoomLevel.areaThreshold);
            const snapshot = r.snapshot();
            path.addPath(ringToPath(snapshot));
            return snapshot;
        });

        pathPerZoom.set(index, path);
        active = active.filter((_, i) =>
            snapshot[i].length >= 3
        );
    }

    return { bbox, pathPerZoom };
}

registerGeometry<PolygonGeometry, BuiltPolygon>('Polygon', {
    prepare(geometry, zoomLevels) {
        return buildPolygon(geometry.coordinates, zoomLevels);
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        const path = prepared.pathPerZoom.get(zoomIndex);
        if (!path) return;
        mergedPath.addPath(path);
        stats.calls++;

    }
})