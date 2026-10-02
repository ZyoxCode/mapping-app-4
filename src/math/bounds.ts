import { lonLatToMercator } from "./projection";
import type { Bounds, Point } from "./types";

export function updateBounds({ maxCorner, minCorner }: Bounds, x: number, y: number) {
    minCorner.x = Math.min(minCorner.x, x);
    minCorner.y = Math.min(minCorner.y, y);
    maxCorner.x = Math.max(maxCorner.x, x);
    maxCorner.y = Math.max(maxCorner.y, y);
}

export function computeCoordsBounds(coords: number[][]): Bounds {
    const bounds: Bounds = { maxCorner: { x: -Infinity, y: -Infinity }, minCorner: { x: Infinity, y: Infinity } };

    coords.forEach(([lon, lat]) => {
        const { x, y } = lonLatToMercator({ x: lon, y: lat });
        updateBounds(bounds, x, y);

    });
    return bounds;
}

export function unionBounds(boxes: Bounds[]): Bounds {
    const result: Bounds = { maxCorner: { x: -Infinity, y: -Infinity }, minCorner: { x: Infinity, y: Infinity } };
    for (const b of boxes) {
        result.minCorner.x = Math.min(result.minCorner.x, b.minCorner.x);
        result.minCorner.y = Math.min(result.minCorner.y, b.minCorner.y);
        result.maxCorner.x = Math.max(result.maxCorner.x, b.maxCorner.x);
        result.maxCorner.y = Math.max(result.maxCorner.y, b.maxCorner.y);
    }
    return result;
}

export function boundsIntersect({ maxCorner: maxCorner1, minCorner: minCorner1 }: Bounds, { maxCorner: maxCorner2, minCorner: minCorner2 }: Bounds) {
    return maxCorner1.x >= minCorner2.x && maxCorner2.x >= minCorner1.x && maxCorner1.y >= minCorner2.y && maxCorner2.y >= minCorner1.y
}

export function boundsContainsPoint(bounds: Bounds, point: Point): boolean {
    return point.x >= bounds.minCorner.x && point.x <= bounds.maxCorner.x &&
        point.y >= bounds.minCorner.y && point.y <= bounds.maxCorner.y;
}