import { coordPairToPoint, lonLatToMercator, vectorLength, vectorSubtract, type Bounds, type Point } from "../../math";

export type Coord = number[];
export type Ring = Coord[];
export type Polygon = Ring[];
export type MultiPolygon = Polygon[];

export interface BuiltCoord {
    coord: Point;
    importance: number;
}

export interface BuiltRing {
    coords: BuiltCoord[];
    bbox: Bounds;
}

export type BuiltPolygon = BuiltRing[]; // because we get the bbox of the first ring

export interface BuiltMultiPolygon {
    polygons: BuiltPolygon[];
    bbox: Bounds;
}


export function removeDuplicateEnds(ring: Ring, epsilon=1e-5): Ring {

    const first = coordPairToPoint(ring[0] as [number, number]);
    const last = coordPairToPoint(ring[ring.length - 1] as [number, number]);

    if (vectorLength(vectorSubtract(last, first)) < epsilon) {
        return ring.slice(0, -1);
    }

    return ring;
}


export function ringToPath(ring: Ring, close=false) {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        i == 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    });
    if (close) path.closePath();
    return path;
}

export function ringArea(ring: number[][]): number {
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[(i + 1) % ring.length];
        area += x0 * y1 - x1 * y0;
    }
    return Math.abs(area / 2);
}

export function builtRingArea(coords: BuiltCoord[]): number {
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
        const a = coords[i].coord;
        const b = coords[(i + 1) % n].coord;
        area += a.x * b.y - b.x * a.y;
    }
    return Math.abs(area / 2);
}