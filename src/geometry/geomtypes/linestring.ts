import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../simplification/simplify";
import { builtRingArea, removeDuplicateEnds, ringToPath, type BuiltPolygon, type BuiltRing, type Polygon } from "./utils";

export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: Polygon;
}


registerGeometry<PolygonGeometry, BuiltPolygon>('LineString', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltPolygon>();

        let active = geometry.coordinates.map(ring => {
            console.log(ring);
            removeDuplicateEnds(ring);
            return {simplifier: new RingSimplifier(buildRing(ring, false)), bbox: computeCoordsBounds(ring)};
        });

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            const snapshot: BuiltRing[] = active.map(r => {
                if (zoomLevel.areaThreshold != 0) r.simplifier.simplify(zoomLevel.areaThreshold);
                return {coords: r.simplifier.snapshot(), bbox: r.bbox};
            });
            
            builtPerZoom.set(index, snapshot);
            active = active.filter((_, i) =>
                snapshot[i].coords.length >= 3 &&
                builtRingArea(snapshot[i].coords) >= zoomLevel.areaThreshold
            );
        }

        const bbox = computeCoordsBounds(geometry.coordinates[0])
        return {type: geometry.type, bbox: bbox, builtPerZoom: builtPerZoom};
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) {return;}
        
        const built = prepared.builtPerZoom.get(zoomIndex);
        if (!built) return;
        for (const ring of built) {
            if (!boundsIntersect(ring.bbox, visibleBounds)) continue;

            mergedPath.addPath(ringToPath(ring.coords.map(coord => [coord.coord.x, coord.coord.y])));
        }
    }
})