import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, removeAndRecalculate } from "../simplification/simplify";
import { removeDuplicateEnds, ringToPath, type BuiltPolygon, type BuiltRing, type Polygon } from "./utils";

export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: Polygon;
}


registerGeometry<PolygonGeometry, BuiltPolygon>('Polygon', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltPolygon>();
        
        let newRings = geometry.coordinates.map(ring => {
            removeDuplicateEnds(ring);
            return {coords: buildRing(ring), bbox: computeCoordsBounds(ring)};
        }) as BuiltRing[];

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            if (zoomLevel.areaThreshold != 0) {for (let i = 0; i < newRings.length; i++) {
                let ringCoords = newRings[i].coords;
                for (let j = 0; j < ringCoords.length; j++) {
                    if (ringCoords[j].importance < zoomLevel.areaThreshold) {
                        newRings[i].coords = removeAndRecalculate(ringCoords, j);
                        j--;
                    }
                }
            }}
            builtPerZoom.set(index, structuredClone(newRings) as BuiltPolygon);
            newRings = newRings.filter(r => r.coords.length > 3);
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