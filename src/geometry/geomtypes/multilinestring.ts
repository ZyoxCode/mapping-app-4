import { boundsIntersect, computeCoordsBounds, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import { builtRingArea, ringToPath, type BuiltMultiPolygon, type BuiltRing, type MultiPolygon } from "./utils";
import type {Bounds} from "../../math";
import { buildRing, RingSimplifier } from "../simplification/simplify";

export interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: MultiPolygon;
}

registerGeometry<MultiPolygonGeometry, BuiltMultiPolygon>('MultiLineString', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltMultiPolygon>();
        let active = geometry.coordinates.map(poly => {
            return poly.map((ring) => {
                return {simplifier: new RingSimplifier(buildRing(ring)), bbox: computeCoordsBounds(ring)};
            })
        })

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            const snapshots: BuiltRing[][] = active.map(poly =>
                poly.map(r => {
                    if (zoomLevel.areaThreshold !== 0) r.simplifier.simplify(zoomLevel.areaThreshold);
                    return {coords: r.simplifier.snapshot(), bbox: r.bbox};
                })
            );

            builtPerZoom.set(index, {
                polygons: snapshots.map(poly =>
                    poly.filter(ring => ring.coords.length >= 3 && ring.coords.length >= zoomLevel.areaThreshold)
                ).filter(poly => builtRingArea(poly[0].coords) >= zoomLevel.areaThreshold),
                bbox: unionBounds(active.map(polygon => polygon[0]?.bbox).filter(Boolean))
            } as BuiltMultiPolygon);

            active = active.filter((poly, p) =>
                poly.length > 0 &&
                snapshots[p].every(r =>
                    r.coords.length >= 3 &&
                    builtRingArea(r.coords) >= zoomLevel.areaThreshold
                )
            );
        }
        let bbox = {maxCorner: {x: 0, y: 0}, minCorner: {x: 0, y: 0}} as Bounds;
        const index = zoomLevels.keys().next().value
        if (index != null) {
            bbox = builtPerZoom.get(index)?.bbox as Bounds;
        }
        return {type: geometry.type, bbox: bbox, builtPerZoom: builtPerZoom};
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) {return;}
        const built = prepared.builtPerZoom.get(zoomIndex);
        if (!built) return;
        for (const poly of built.polygons) {
            if (!boundsIntersect(poly[0].bbox, visibleBounds)) continue;
            for (const ring of poly) {
                if (!boundsIntersect(ring.bbox, visibleBounds)) continue;
                mergedPath.addPath(ringToPath(ring.coords.map(coord => [coord.coord.x, coord.coord.y])));
            }
        }
    }
})