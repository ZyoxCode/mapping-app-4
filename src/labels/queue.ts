import type { LabelQueueEntry, ScreenBox } from "./types";
import { wrapText } from "./utils";

export function renderLabelQueue(
    ctx: CanvasRenderingContext2D,
    queue: LabelQueueEntry[],
    scale: number,
    translateX: number,
    translateY: number,
    maxChars: number,
): void {
    if (queue.length === 0) return;

    const sorted = [...queue].sort((a, b) => {
        if (a.scaleRank !== b.scaleRank) return a.scaleRank - b.scaleRank;
        if (a.labelRank !== b.labelRank) return a.labelRank - b.labelRank;
        return a.text.length - b.text.length;
    });

    const placedBoxes: ScreenBox[] = [];

    for (const label of sorted) {
        const padding = 4;
        const pointTextPadding = 2;

        const pointX = label.coords.x * scale + translateX;
        const pointY = -label.coords.y * scale + translateY;
        const pointEnabled = label.style.enabled.labelPoint;

        const textX = pointX + (
            pointEnabled ? label.style.styleOptions.pointRadii[0] + pointTextPadding : 0
        )
        const textY = pointY

        label.style.apply(ctx, 1);

        const lines = wrapText(label.text, maxChars);

        const metrics = ctx.measureText(label.text);
        const textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || 12;

        const widestLine = Math.max(0, ...lines.map(line => ctx.measureText(line).width));
        const halfWidth = widestLine / 2 + padding;
        const lineCount = Math.max(lines.length, 1);
        const halfHeight = (textHeight * lineCount) / 2 + padding;

        const box: ScreenBox = {
            left: (label.style.styleOptions.textAlign == 'left')
                ? textX : textX - halfWidth,
            right: (label.style.styleOptions.textAlign == 'left')
                ? textX + halfWidth * 2 : textX + halfWidth,
            top: textY - halfHeight,
            bottom: textY + halfHeight,
        };

        const overlaps = placedBoxes.some(p =>
            !(box.right < p.left || box.left > p.right || box.bottom < p.top || box.top > p.bottom)
        );

        if (!overlaps) {
            placedBoxes.push(box);
            ctx.textBaseline = 'middle';
            if (pointEnabled) {
                ctx.beginPath();
                for (const radius of label.style.styleOptions.pointRadii) {
                    ctx.arc(pointX, pointY, radius, 0, Math.PI * 2);
                }
                ctx.closePath();
                ctx.fill('evenodd');
            }
            const lineHeight = textHeight + padding * 0.5;
            lines.forEach((line, i) => {
                const y = textY - (lineCount - 1) * lineHeight / 2 + i * lineHeight;
                if (ctx.strokeStyle) ctx.strokeText(line, textX, y);
                ctx.fillText(line, textX, y);
            });
        }
    }
}