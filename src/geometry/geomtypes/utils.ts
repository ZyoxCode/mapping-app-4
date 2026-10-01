import { lonLatToMercator } from "../../math/utils";

export type Coord = number[];
export type Ring = Coord[];
export type Polygon = Ring[];
export type MultiPolygon = Polygon[];


export function ringToPath(ring: Ring, close=false) {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        i == 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    });
    if (close) path.closePath();
    return path;
}

