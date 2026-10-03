import { boundsIntersect, computeCoordsBounds } from "../../math";
import { registerGeometry } from "../registry";
import { buildRing, RingSimplifier } from "../simplification/simplify";
import { builtLineLength, ringToPath, type BuiltLineString, type LineString } from "./utils";

export interface LineStringGeometry {
    type: 'LineString';
    coordinates: LineString;
}


registerGeometry<LineStringGeometry, BuiltLineString>('LineString', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltLineString>();


        let simplifier = new RingSimplifier(buildRing(geometry.coordinates, false), false);
        let bbox = computeCoordsBounds(geometry.coordinates);

        let active = { simplifier, bbox }

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            if (zoomLevel.areaThreshold != 0) { active.simplifier.simplify(zoomLevel.areaThreshold); }

            const coords = active.simplifier.snapshot();
            const snapshot: BuiltLineString = { coords, bbox: active.bbox, path: ringToPath(coords.map(coord => [coord.coord.x, coord.coord.y]), false) };

            if (coords.length < 2 || builtLineLength(coords) < zoomLevel.areaThreshold) { break; }

            builtPerZoom.set(index, snapshot);
        }

        return { type: geometry.type, bbox: bbox, builtPerZoom: builtPerZoom };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        const built = prepared.builtPerZoom.get(zoomIndex);
        if (!built) { return; }
        mergedPath.addPath(built.path);
    },
})