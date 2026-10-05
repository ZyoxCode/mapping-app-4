import { type LabelQueueEntry, type ScreenBox } from "../types";

export function renderLabelQueue(
    ctx: CanvasRenderingContext2D,
    queue: LabelQueueEntry[],
    scale: number,
    translateX: number,
    translateY: number,
): void {
    if (queue.length === 0) return;

    const sorted = [...queue].sort((a, b) => {
        if (a.labelRank !== b.labelRank) return a.labelRank - b.labelRank;
        if (a.scaleRank !== b.scaleRank) return a.scaleRank - b.scaleRank;
        return a.lines.length - b.lines.length;
    });

    const placedBoxes: ScreenBox[] = [];
    console.log(sorted);
    for (const label of sorted) {

        const pointX = label.coords[0] * scale + translateX;
        const pointY = -label.coords[1] * scale + translateY;

        const left = pointX + label.screenBox.left;
        const right = pointX + label.screenBox.right;
        const top = pointY + label.screenBox.top;
        const bottom = pointY + label.screenBox.bottom;

        const overlaps = placedBoxes.some(p =>
            !(right < p.left || left > p.right || bottom < p.top || top > p.bottom)
        );


        if (overlaps) continue;

        placedBoxes.push({ left, right, top, bottom });

        label.style.apply(ctx, 1);
        ctx.textBaseline = 'middle';

        if (label.marker != null) {
            ctx.beginPath();
            for (const radius of label.marker.radii) {
                ctx.arc(pointX, pointY, radius, 0, Math.PI * 2);
            }
            ctx.closePath();
            ctx.fill('evenodd');
        }

        const textX = pointX + label.offsetX;
        const lineCount = Math.max(label.lines.length, 1);
        label.lines.forEach((line, i) => {
            const y = pointY - (lineCount - 1) * label.lineHeight / 2 + i * label.lineHeight;
            if (ctx.strokeStyle) ctx.strokeText(line, textX, y);
            ctx.fillText(line, textX, y);
        });
    }
}