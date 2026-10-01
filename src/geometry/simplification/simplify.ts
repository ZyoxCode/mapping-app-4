import { coordPairToPoint, triangleArea } from "../../math";
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

export function removeAndRecalculate(ring: BuiltCoord[], index: number, closed=false): BuiltCoord[] {
    ring.splice(index, 1);

    let i = index - 1;
    let prev = ring[(i - 1 + ring.length) % ring.length] as BuiltCoord;
    let current = ring[(i + ring.length) % ring.length ] as BuiltCoord;
    let next = ring[(i + 1 + ring.length) % ring.length ] as BuiltCoord;

    ring[(i + ring.length) % ring.length].importance = triangleArea(prev.coord, current.coord, next.coord);

    i = i + 1;

    prev = ring[(i - 1 + ring.length) % ring.length] as BuiltCoord;
    current = ring[(i + ring.length) % ring.length ] as BuiltCoord;
    next = ring[(i + 1 + ring.length) % ring.length ] as BuiltCoord;

    ring[(i + ring.length) % ring.length].importance = triangleArea(prev.coord, current.coord, next.coord);

    return ring;
}