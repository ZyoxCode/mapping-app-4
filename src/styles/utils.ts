import { type StyleRule } from "../types";
import { Style } from "./class";


export function resolveStyle<P>(rules: StyleRule<P>[], properties: P, webMercZoom: number): Style | null {
    const match = rules.find(rule => rule.when(properties, webMercZoom));
    return match ? match.style : null;
}

export function always(style: Style): StyleRule[] {
    return [{ when: () => true, style }];
}