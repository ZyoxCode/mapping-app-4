import type { GeometryPerZoom } from "../geometry/types";
import type { Point } from "../math";

export interface Feature<BuiltType = any> {
    geometryByZoom: GeometryPerZoom<BuiltType>
    properties: Record<string, any> | null;
    rawGeometry: any;
    labelCoords: Point | null;
}