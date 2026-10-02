import { coordPairToPoint, triangleArea, type Point } from "../../math";
import type { BuiltCoord, BuiltRing, Ring } from "../geomtypes/utils";

export function buildRing(ring: Ring, closed=false): BuiltCoord[] {
  
    if ((closed && ring.length <= 3) || (!closed && ring.length <= 2)) {
        return ring.map((coord) => ({ 
            coord: coordPairToPoint(coord), importance: Infinity }
        ));
    }
    const newRing: BuiltCoord[] = [];

    for (let i = 0; i < ring.length; i++) {
        let prev = coordPairToPoint(ring[(i - 1 + ring.length) % ring.length] as [number, number]);
        let current = coordPairToPoint(ring[i] as [number, number]);
        let next = coordPairToPoint(ring[(i + 1) % ring.length] as [number, number]);
        if (!closed && (i == 0 || i == ring.length - 1)) {
            newRing.push({ coord: current, importance: Infinity });
        } else {
            newRing.push({ coord: current, importance: triangleArea(prev, current, next) });
        }
        prev = current;
        next = coordPairToPoint(ring[(i + 2) % ring.length] as [number, number]);

    }

    return newRing;
}

export function removeAndRecalculate(ring: BuiltCoord[], index: number, closed = false): BuiltCoord[] {
    ring.splice(index, 1);
    
    if (ring.length < 3) return ring;

    // Fix index wrap-around safety for neighboring nodes
    const len = ring.length;
    const prevIdx = (index - 1 + len) % len;
    const currIdx = index % len;

    // Recalculate node left of deletion point
    const pPrev = ring[(prevIdx - 1 + len) % len].coord;
    const pCurr = ring[prevIdx].coord;
    const pNext = ring[(prevIdx + 1) % len].coord;
    ring[prevIdx].importance = triangleArea(pPrev, pCurr, pNext);

    // Recalculate node right of deletion point (now shifted into currIdx)
    const nPrev = ring[(currIdx - 1 + len) % len].coord;
    const nCurr = ring[currIdx].coord;
    const nNext = ring[(currIdx + 1) % len].coord;
    ring[currIdx].importance = triangleArea(nPrev, nCurr, nNext);

    return ring;
}

class MinHeap {
    private keys: number[] = [];
    private vals: number[] = [];

    get size() { return this.keys.length; }
    peekKey() { return this.keys[0]; }

    push(key: number, val: number) {
        const keys = this.keys, vals = this.vals;
        let i = keys.length;
        keys.push(key);
        vals.push(val);
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (keys[parent] <= key) break;
            keys[i] = keys[parent];
            vals[i] = vals[parent];
            i = parent;
        }
        keys[i] = key;
        vals[i] = val;
    }

    /** Removes the smallest entry and returns its value. */
    pop(): number {
        const keys = this.keys, vals = this.vals;
        const top = vals[0];
        const lastKey = keys.pop()!;
        const lastVal = vals.pop()!;
        const n = keys.length;
        if (n > 0) {
            let i = 0;
            while (true) {
                let child = 2 * i + 1;
                if (child >= n) break;
                if (child + 1 < n && keys[child + 1] < keys[child]) child++;
                if (keys[child] >= lastKey) break;
                keys[i] = keys[child];
                vals[i] = vals[child];
                i = child;
            }
            keys[i] = lastKey;
            vals[i] = lastVal;
        }
        return top;
    }
}

/**
 * Incremental Visvalingam-Whyatt simplification of one ring.
 * Uses a doubly linked list (O(1) removal) and a min-heap with lazy
 * invalidation, and keeps its state between calls so increasing thresholds
 * continue where the previous one stopped.
 */
export class RingSimplifier {
    private readonly points: Point[];
    private readonly importance: Float64Array;
    private readonly prev: Int32Array;
    private readonly next: Int32Array;
    private readonly alive: Uint8Array;
    private readonly heap = new MinHeap();
    private head = 0;
    private count: number;

    constructor(ring: BuiltCoord[]) {
        const n = ring.length;
        this.count = n;
        this.points = new Array(n);
        this.importance = new Float64Array(n);
        this.prev = new Int32Array(n);
        this.next = new Int32Array(n);
        this.alive = new Uint8Array(n).fill(1);
        for (let i = 0; i < n; i++) {
            this.points[i] = ring[i].coord;
            this.importance[i] = ring[i].importance;
            this.prev[i] = (i - 1 + n) % n;
            this.next[i] = (i + 1) % n;
            if (Number.isFinite(ring[i].importance)) this.heap.push(ring[i].importance, i);
        }
    }

    /** Removes vertices with importance below the threshold, never going under 3 vertices. */
    simplify(threshold: number): void {
        const heap = this.heap;
        while (this.count > 3 && heap.size > 0 && heap.peekKey() < threshold) {
            const key = heap.peekKey();
            const idx = heap.pop();
            if (!this.alive[idx] || key !== this.importance[idx]) continue; // stale entry
            this.remove(idx);
        }
    }

    /** Returns the current vertices in order, as a fresh array. */
    snapshot(): BuiltCoord[] {
        const out: BuiltCoord[] = new Array(this.count);
        let i = this.head;
        for (let k = 0; k < this.count; k++) {
            out[k] = { coord: this.points[i], importance: this.importance[i] };
            i = this.next[i];
        }
        return out;
    }

    private remove(idx: number): void {
        const p = this.prev[idx], n = this.next[idx];
        this.next[p] = n;
        this.prev[n] = p;
        this.alive[idx] = 0;
        this.count--;
        if (this.head === idx) this.head = n;
        this.refresh(p);
        this.refresh(n);
    }

    private refresh(i: number): void {
        const imp = triangleArea(this.points[this.prev[i]], this.points[i], this.points[this.next[i]]);
        this.importance[i] = imp;
        this.heap.push(imp, i);
    }
}