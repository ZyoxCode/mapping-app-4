import { boundsIntersect, unionBounds } from "../../math";
import { registerGeometry } from "../registry";
import { type Bounds, type BuiltMultiPolygon, type Point, type ZoomLevel } from "../../types";
import { packPolygon, unpackPolygon, type PackedPolygon } from "./polygon";

export const stats = { calls: 0 };

export interface MultiPolygonGeometry {
    type: 'MultiPolygon';
    coordinates: Point[][][];
}

export interface PackedMultiPolygon {
    bbox: Bounds;
    children: PackedPolygon[];
}

registerGeometry<MultiPolygonGeometry, PackedMultiPolygon, BuiltMultiPolygon>('MultiPolygon', {
    pack(geometry, zoomLevels: ZoomLevel[]) {
        const children = geometry.coordinates.map(poly => packPolygon(poly, zoomLevels));
        const bbox = unionBounds(children.map(p => p.bbox));
        return { bbox, children };
    },
    unpack(packed) {
        return {
            bbox: packed.bbox,
            children: packed.children.map(unpackPolygon),
        };
    },
    appendToPath(mergedPath, prepared, visibleBounds, zoomIndex) {
        if (!boundsIntersect(prepared.bbox, visibleBounds)) { return; }

        for (const poly of prepared.children) {
            if (!boundsIntersect(poly.bbox, visibleBounds)) continue;

            const path = poly.pathPerZoom.get(zoomIndex);
            if (!path) continue;
            mergedPath.addPath(path);
            stats.calls++;
        }
    }
});