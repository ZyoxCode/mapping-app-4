import simplificationSrc from '../geometry/utils/simplification.ts?raw';
import generalSrc from '../geometry/utils/general.ts?raw';
import polygonSrc from '../geometry/type-handlers/polygon.ts?raw';
import lineSrc from '../geometry/type-handlers/linestring.ts?raw';
import type { ZoomLevel } from '../types';

async function sha256(text: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const algoHash = sha256([simplificationSrc, generalSrc, polygonSrc, lineSrc].join('\n'));

export async function layerKey(name: string, dataFingerprint: string, zoomLevels: ZoomLevel[]) {
    return sha256([await algoHash, name, dataFingerprint, JSON.stringify(zoomLevels)].join('|'));
}