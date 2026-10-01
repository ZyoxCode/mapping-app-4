import {type Point} from "./types";

export function coordPairToPoint(coordPair: number[]): Point {
    return {x: coordPair[0], y: coordPair[1]};
}

export function vectorAdd(p1: Point, p2: Point): Point {
    return {x: p1.x + p2.x, y: p1.y + p2.y};
}

export function vectorSubtract(p1: Point, p2: Point): Point {
    return {x: p1.x - p2.x, y: p1.y - p2.y};
}

export function vectorScale(p: Point, scalar: number): Point {
    return {x: p.x * scalar, y: p.y * scalar};
}

export function vectorDot(p1: Point, p2: Point): number {
    return p1.x * p2.x + p1.y * p2.y;
}

export function vectorCross(p1: Point, p2: Point): number {
    return p1.x * p2.y - p1.y * p2.x;
}

export function vectorLength(p: Point): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function triangleArea(p1: Point, p2: Point, p3: Point): number {
    const v1 = vectorSubtract(p2, p1);
    const v2 = vectorSubtract(p3, p1);
    return Math.abs(vectorCross(v1, v2)) / 2;
} // Shoelace formula