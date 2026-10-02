import { coordPairToPoint, lonLatToMercator, vectorLength, vectorSubtract, type Bounds, type Point } from "../../math";

export type Coord = number[];
export type Ring = Coord[];
export type Polygon = Ring[];
export type MultiPolygon = Polygon[];
export type LineString = Coord[];
export type MultiLineString = LineString[];

export interface BuiltCoord {
    coord: Point;
    importance: number;
}

export interface BuiltRing {
    coords: BuiltCoord[];
    bbox: Bounds;
}

export type BuiltLineString = {
    coords: BuiltCoord[];
    bbox: Bounds;
}

export type BuiltMultiLineString = {
    lines: BuiltLineString[];
    bbox: Bounds;
}

export type BuiltPolygon = BuiltRing[]; // because we get the bbox of the first ring

export interface BuiltMultiPolygon {
    polygons: BuiltPolygon[];
    bbox: Bounds;
}

export function removeDuplicateEnds(ring: Coord[], epsilon = 1e-5): Coord[] {

    const first = coordPairToPoint(ring[0] as [number, number]);
    const last = coordPairToPoint(ring[ring.length - 1] as [number, number]);

    if (vectorLength(vectorSubtract(last, first)) < epsilon) {
        return ring.slice(0, -1);
    }

    return ring;
}

export function ringToPath(ring: number[][], close = false) {
    const path = new Path2D();
    ring.forEach(([lon, lat], i) => {
        const { x, y } = lonLatToMercator({ x: lon, y: lat });
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

export function builtLineLength(coords: BuiltCoord[]): number {
    let length = 0;
    const n = coords.length;
    for (let i = 0; i < n - 1; i++) {
        length += vectorLength(vectorSubtract(coords[i].coord, coords[i + 1].coord));
    }

    return length;
}

function coordKey(c: Coord, precision = 7): string {
    return `${c[0].toFixed(precision)},${c[1].toFixed(precision)}`;
}
export function mergeLineStrings(lines: Coord[][]): Coord[][] {
    const endpointMap = new Map<string, { lineIndex: number; end: 'start' | 'end' }[]>();

    lines.forEach((line, i) => {
        if (line.length < 2) return;
        const push = (key: string, entry: { lineIndex: number; end: 'start' | 'end' }) => {
            const list = endpointMap.get(key);
            list ? list.push(entry) : endpointMap.set(key, [entry]);
        };
        push(coordKey(line[0]), { lineIndex: i, end: 'start' });
        push(coordKey(line[line.length - 1]), { lineIndex: i, end: 'end' });
    });

    const used = new Array(lines.length).fill(false);
    const merged: Coord[][] = [];

    function nextAt(key: string, exclude: number) {
        const entries = endpointMap.get(key) ?? [];
        if (entries.length !== 2) return null; // 1 = dead end, 3+ = real junction — stop either way
        const other = entries.find(e => e.lineIndex !== exclude);
        return other && !used[other.lineIndex] ? other : null;
    }

    for (let i = 0; i < lines.length; i++) {
        if (used[i] || lines[i].length < 2) continue;
        used[i] = true;
        let chain = lines[i].slice();
        let tail = i;

        for (let next = nextAt(coordKey(chain[chain.length - 1]), tail); next;) {
            const nextLine = lines[next.lineIndex];
            chain = chain.concat(next.end === 'start' ? nextLine.slice(1) : nextLine.slice(0, -1).reverse());
            used[next.lineIndex] = true;
            tail = next.lineIndex;
            next = nextAt(coordKey(chain[chain.length - 1]), tail);
        }

        let head = i;
        for (let prev = nextAt(coordKey(chain[0]), head); prev;) {
            const prevLine = lines[prev.lineIndex];
            chain = (prev.end === 'end' ? prevLine.slice(0, -1) : prevLine.slice(1).reverse()).concat(chain);
            used[prev.lineIndex] = true;
            head = prev.lineIndex;
            prev = nextAt(coordKey(chain[0]), head);
        }

        merged.push(chain);
    }

    return merged;
}