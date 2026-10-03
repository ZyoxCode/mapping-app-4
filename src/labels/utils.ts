import type { LabelRule } from "./types";

export function wrapText(text: string, maxChars: number): string[] {
    if (maxChars <= 0) return [text];

    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const testLine = current ? `${current} ${word}` : word;
        if (testLine.length > maxChars && current) {
            lines.push(current);
            current = word;
        } else {
            current = testLine;
        }
    }
    if (current) lines.push(current);

    return lines;
}

/** Break a single word wider than `maxWidth` by characters. */
export function breakLongWord(line: string, ctx: CanvasRenderingContext2D, maxWidth: number): string {
    if (ctx.measureText(line).width <= maxWidth) return line;
    for (let i = line.length; i > 0; i--) {
        const candidate = line.slice(0, i);
        if (ctx.measureText(candidate).width <= maxWidth) return candidate;
    }
    return line;
}

export function resolveLabelRule<P>(rules: LabelRule<P>[], properties: P, webMercZoom: number): LabelRule<P> | null {
    return rules.find(rule => rule.when(properties, webMercZoom)) ?? null;
}

export function capitalize(text: string): string {
    if (!text) return text;
    return text.toUpperCase();
}