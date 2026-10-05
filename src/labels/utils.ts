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