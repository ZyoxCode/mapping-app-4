import type { Bounds, Point } from "./types";

function clampLat(lat: number): number {
    return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function clampLon(lon: number): number {
    return Math.max(-180, Math.min(180, lon));
}

function mercatorX(lon: number): number {
    return lon * Math.PI / 180;
}

function mercatorY(lat: number): number {
    const latRad = lat * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

export function lonLatToMercator({ x, y }: Point): Point {
    return {
        x: mercatorX(clampLon(x)),
        y: mercatorY(clampLat(y))
    };
}

export function updateBounds({maxCorner, minCorner}: Bounds, x: number, y: number) {
    minCorner.x = Math.min(minCorner.x, x);
    minCorner.y = Math.min(minCorner.y, y);
    maxCorner.x = Math.max(maxCorner.x, x);
    maxCorner.y = Math.max(maxCorner.y, y);
}

export function computeCoordsBounds(coords: number[][]): Bounds {
    const bounds: Bounds = {maxCorner: {x: -Infinity, y: -Infinity}, minCorner: {x: Infinity, y: Infinity}};

    coords.forEach(([lon, lat]) => {
        const {x, y} = lonLatToMercator({x: lon, y: lat});
        updateBounds(bounds, x, y);
       
    });
    return bounds;
}

export function boundsIntersect({maxCorner: maxCorner1, minCorner: minCorner1}: Bounds, {maxCorner: maxCorner2, minCorner: minCorner2}: Bounds) {
    return maxCorner1.x >= minCorner2.x && maxCorner2.x >= minCorner1.x && maxCorner1.y >= minCorner2.y && maxCorner2.y >= minCorner1.y
}

export function scaleToWebMercatorZoom(currentScale: number, tileSize: number = 256): number {
    if (currentScale <= 0) return 0;
    
    const zoom = Math.log2(currentScale / tileSize);
    
    return Math.max(0, zoom);
}
