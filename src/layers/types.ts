import type { GeometryPerZoom } from "../geometry/types";

export interface Feature<BuiltType = any> {
    geometryByZoom: GeometryPerZoom<BuiltType>
    properties: Record<string, any> | null;
}