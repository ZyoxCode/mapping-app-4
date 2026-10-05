import { boundsIntersect, unionBounds } from "../../math";
import { registerGeometry } from "../registry.ts";
import type { BuiltMultiLineString, BuiltLineString, Point } from "../../types";
import { mergeLineStrings } from "../utils/general.ts";
import { buildLineString } from "./linestring.ts";

import { stats } from "./multipolygon.ts";
export interface MultiLineStringGeometry {
    type: 'LineString';
    coordinates: Point[][];
}

registerGeometry<MultiLineStringGeometry, BuiltMultiLineString>('MultiLineString', {
    prepare(geometry, zoomLevels) {
        const merged = mergeLineStrings(geometry.coordinates);
        const children: BuiltLineString[] = merged.map(line => buildLineString(line, zoomLevels));
        const bbox = unionBounds(children.map(p => p.bbox));

        return { children, bbox };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        for (const line of prepared.children) {
            if (!boundsIntersect(line.bbox, visibleBounds)) continue;

            const path = line.pathPerZoom.get(zoomIndex);
            if (!path) continue;
            stats.calls++;
            mergedPath.addPath(path);
        }
    },
})