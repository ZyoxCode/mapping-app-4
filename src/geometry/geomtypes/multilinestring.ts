import { boundsIntersect, computeCoordsBounds, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import { builtLineLength, mergeLineStrings, ringToPath, type BuiltLineString, type BuiltMultiLineString, type MultiLineString } from "./utils";
import { buildRing, RingSimplifier } from "../simplification/simplify";

export interface MultiLineStringGeometry {
    type: 'MultiLineString';
    coordinates: MultiLineString;
}

registerGeometry<MultiLineStringGeometry, BuiltMultiLineString>('MultiLineString', {
    prepare(geometry, zoomLevels) {
        const builtPerZoom = new Map<number, BuiltMultiLineString>();
        const mergedLines = mergeLineStrings(geometry.coordinates);

        let active = mergedLines.map(line => ({
            simplifier: new RingSimplifier(buildRing(line, false), false),
            bbox: computeCoordsBounds(line)
        }));

        const overallBbox = unionBounds(active.map(item => item.bbox));

        for (const [index, zoomLevel] of zoomLevels.entries()) {
            const lines: BuiltLineString[] = [];

            for (const item of active) {
                if (zoomLevel.areaThreshold !== 0) {
                    item.simplifier.simplify(zoomLevel.areaThreshold);
                }
                const coords = item.simplifier.snapshot();
                if (coords.length >= 2 && builtLineLength(coords) >= zoomLevel.areaThreshold) {
                    lines.push({ coords, bbox: item.bbox });
                }
            }

            if (lines.length === 0) {
                break;
            }

            const zoomBbox = unionBounds(lines.map(line => line.bbox));
            builtPerZoom.set(index, { lines, bbox: zoomBbox });
        }

        return { type: geometry.type, bbox: overallBbox, builtPerZoom };
    },

    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        const built = prepared.builtPerZoom.get(zoomIndex);
        if (!built || !boundsIntersect(built.bbox, visibleBounds)) { return; }

        for (const line of built.lines) {
            if (boundsIntersect(line.bbox, visibleBounds)) {
                mergedPath.addPath(ringToPath(line.coords.map(coord => [coord.coord.x, coord.coord.y]), false));
            }
        }
    },
})