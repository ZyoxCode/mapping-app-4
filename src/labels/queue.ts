import type { LabelQueueEntry, ScreenBox } from "./types";
import { wrapText } from "./utils";

export function renderLabelQueue(
    ctx: CanvasRenderingContext2D,
    queue: LabelQueueEntry[],
    scale: number,
    translateX: number,
    translateY: number,
    maxWidth: number,
): void {
    if (queue.length === 0) return;

    const sorted = [...queue].sort((a, b) => {
        if (a.scaleRank !== b.scaleRank) return a.scaleRank - b.scaleRank;
        if (a.labelRank !== b.labelRank) return a.labelRank - b.labelRank;
        return a.text.length - b.text.length;
    });

    const placedBoxes: ScreenBox[] = [];

    for (const label of sorted) {
        const screenX = label.coords.x * scale + translateX;
        const screenY = -label.coords.y * scale + translateY;

        label.style.apply(ctx, 1);

        const lines = wrapText(label.text, ctx, maxWidth);

        const metrics = ctx.measureText(label.text);
        const textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || 12;
        const padding = 4;
        const halfWidth = maxWidth / 2 + padding;
        const lineCount = Math.max(lines.length, 1);
        const halfHeight = (textHeight * lineCount) / 2 + padding;

        const box: ScreenBox = {
            left: screenX - halfWidth, right: screenX + halfWidth,
            top: screenY - halfHeight, bottom: screenY + halfHeight,
        };

        const overlaps = placedBoxes.some(p =>
            !(box.right < p.left || box.left > p.right || box.bottom < p.top || box.top > p.bottom)
        );

        if (!overlaps) {
            placedBoxes.push(box);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lineHeight = textHeight + padding * 0.5;
            lines.forEach((line, i) => {
                const y = screenY - (lineCount - 1) * lineHeight / 2 + i * lineHeight;
                if (ctx.strokeStyle) ctx.strokeText(line, screenX, y);
                ctx.fillText(line, screenX, y);
            });
        }
    }
}