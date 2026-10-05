import { boundsIntersect, computeCoordsBounds, lonLatToMercator } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../utils/simplification"
import { type Point, type ZoomLevel, type Bounds, type BuiltPolygon } from "../../types";
import { flatten, removeDuplicateEnds } from "../utils/general";
import { stats } from "./multipolygon.ts";

export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: Point[][];
}

export interface PackedPolygon {
    bbox: Bounds;
    ringsPerZoom: Float64Array[][]; // [zoomIndex][ring] = flat x,y,x,y... in Mercator
}



export function packPolygon(coordinates: Point[][], zoomLevels: ZoomLevel[]): PackedPolygon {
    const bbox = computeCoordsBounds(coordinates[0]); // compute bbox from first ring

    let active = coordinates.map(ring => {
        removeDuplicateEnds(ring);
        return new RingSimplifier(buildRing(ring, true));
    });

    const ringsPerZoom: Float64Array[][] = [];
    for (const zoomLevel of zoomLevels) {
        const snapshots: Point[][] = active.map(r => {
            if (zoomLevel.areaThreshold != 0) r.simplify(zoomLevel.areaThreshold);
            return r.snapshot();
        });
        ringsPerZoom.push(snapshots.map(flatten));
        active = active.filter((_, i) => snapshots[i].length >= 3);
    }

    return { bbox, ringsPerZoom };
}

// Cheap part: runs on every load.
export function unpackPolygon(packed: PackedPolygon): BuiltPolygon {
    const pathPerZoom = new Map<number, Path2D>();
    packed.ringsPerZoom.forEach((rings, zoomIndex) => {
        const path = new Path2D();
        for (const r of rings) {
            if (r.length < 2) continue;
            path.moveTo(r[0], r[1]);
            for (let i = 2; i < r.length; i += 2) path.lineTo(r[i], r[i + 1]);
        }
        pathPerZoom.set(zoomIndex, path);
    });
    return { bbox: packed.bbox, pathPerZoom };
}

registerGeometry<PolygonGeometry, PackedPolygon, BuiltPolygon>('Polygon', {
    pack(geometry, zoomLevels) {
        return packPolygon(geometry.coordinates, zoomLevels);
    },
    unpack(packed) {
        return unpackPolygon(packed);
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        const path = prepared.pathPerZoom.get(zoomIndex);
        if (!path) return;
        mergedPath.addPath(path);
        stats.calls++;
    }
})