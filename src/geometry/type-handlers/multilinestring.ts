import { boundsIntersect, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import { type BuiltMultiLineString, type Point, type Bounds, type ZoomLevel } from "../../types";
import { packLineString, unpackLineString, type PackedLineString } from "./linestring";

export interface MultiLineStringGeometry {
    type: 'MultiLineString';
    coordinates: Point[][];
}

export interface PackedMultiLineString {
    bbox: Bounds;
    children: PackedLineString[];
}

registerGeometry<MultiLineStringGeometry, PackedMultiLineString, BuiltMultiLineString>('MultiLineString', {
    pack(geometry, zoomLevels: ZoomLevel[]) {
        const children = geometry.coordinates.map(line => packLineString(line, zoomLevels));
        const bbox = unionBounds(children.map(p => p.bbox));
        return { bbox, children };
    },
    unpack(packed) {
        return {
            bbox: packed.bbox,
            children: packed.children.map(unpackLineString),
        };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        for (const line of prepared.children) {
            if (!boundsIntersect(line.bbox, visibleBounds)) continue;

            const path = line.pathPerZoom.get(zoomIndex);
            if (!path) continue;
            mergedPath.addPath(path);
        }
    },
});