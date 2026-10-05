import { type Point } from "../types/geometry";


export function vectorAdd(p1: Point, p2: Point): Point {
    return [p1[0] + p2[0], p1[1] + p2[1]];
}

export function vectorSubtract(p1: Point, p2: Point): Point {
    return [p1[0] - p2[0], p1[1] - p2[1]];
}

export function vectorScale(p: Point, scalar: number): Point {
    return [p[0] * scalar, p[1] * scalar];
}

export function vectorDot(p1: Point, p2: Point): number {
    return p1[0] * p2[0] + p1[1] * p2[1];
}

export function vectorCross(p1: Point, p2: Point): number {
    return p1[0] * p2[1] - p1[1] * p2[0];
}

export function vectorLength(p: Point): number {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}

export function triangleArea(p1: Point, p2: Point, p3: Point): number {
    const v1 = vectorSubtract(p2, p1);
    const v2 = vectorSubtract(p3, p1);
    return Math.abs(vectorCross(v1, v2)) / 2;
} // Shoelace formula
