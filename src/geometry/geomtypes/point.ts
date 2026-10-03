import { boundsIntersect, computeCoordsBounds, coordPairToPoint } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../simplification/simplify";
import { builtLineLength, ringToPath, type BuiltLineString, type BuiltPoint, type Coord } from "./utils";

export interface PointGeometry {
    type: 'Point';
    coordinates: Coord;
}


registerGeometry<PointGeometry, BuiltPoint>('Point', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltPoint>();
        const point = coordPairToPoint(geometry.coordinates);
        const path = new Path2D();
        path.moveTo(point.x, point.y);

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            builtPerZoom.set(index, { coord: point, path: path });
        }

        return { type: geometry.type, bbox: { minCorner: { x: point.x, y: point.y }, maxCorner: { x: point.x, y: point.y } }, builtPerZoom: builtPerZoom };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        const built = prepared.builtPerZoom.get(zoomIndex);
        if (!built) { return; }
        mergedPath.addPath(built.path);
    },
})