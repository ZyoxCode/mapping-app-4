import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../utils/simplification";
import { type ZoomLevel, type BuiltLineString, type Point, type Bounds } from "../../types";
import { flatten } from "../utils/general";

export interface LineStringGeometry {
    type: 'LineString';
    coordinates: Point[];
}

export interface PackedLineString {
    bbox: Bounds;
    pointsPerZoom: Float64Array[]; // [zoomIndex] = flat x,y,x,y... in Mercator
}

// Expensive part: simplification + Mercator conversion. This is what gets cached.
export function packLineString(coordinates: Point[], zoomLevels: ZoomLevel[]): PackedLineString {
    const bbox = computeCoordsBounds(coordinates);
    const simplifier = new RingSimplifier(buildRing(coordinates, false), false);

    const pointsPerZoom: Float64Array[] = [];
    for (const zoomLevel of zoomLevels) {
        if (zoomLevel.areaThreshold != 0) simplifier.simplify(zoomLevel.areaThreshold);
        pointsPerZoom.push(flatten(simplifier.snapshot()));
    }

    return { bbox, pointsPerZoom };
}

// Cheap part: runs on every load.
export function unpackLineString(packed: PackedLineString): BuiltLineString {
    const pathPerZoom = new Map<number, Path2D>();
    packed.pointsPerZoom.forEach((pts, zoomIndex) => {
        const path = new Path2D();
        if (pts.length >= 2) {
            path.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2) path.lineTo(pts[i], pts[i + 1]);
        }
        pathPerZoom.set(zoomIndex, path);
    });
    return { bbox: packed.bbox, pathPerZoom };
}

registerGeometry<LineStringGeometry, PackedLineString, BuiltLineString>('LineString', {
    pack(geometry, zoomLevels) {
        return packLineString(geometry.coordinates, zoomLevels);
    },
    unpack(packed) {
        return unpackLineString(packed);
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) return;

        const path = prepared.pathPerZoom.get(zoomIndex);
        if (!path) return;
        mergedPath.addPath(path);
    },
})