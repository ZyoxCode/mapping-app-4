import { Style } from "../styles/class";

export const STYLES = {
    'disputed': new Style({ strokeColor: '#000000', strokeWidth: 0.5, dashed: [5, 5] }),
    'text1': new Style({ fillColor: '#111111', strokeWidth: 1.3, strokeColor: '#ffffff', font: '700 10px "Inter", sans-serif' }),
    'text1med': new Style({ fillColor: '#111111', strokeWidth: 1, strokeColor: '#ffffff', font: '700 12px "Inter", sans-serif' }),
    'text1large': new Style({ fillColor: '#111111', strokeWidth: 1, strokeColor: '#ffffff', font: '700 14px "Inter", sans-serif' }),
    'text2': new Style({ fillColor: '#4d4d4d', strokeWidth: 1.2, strokeColor: '#ffffff', font: '700 italic 11px "Inter", sans-serif' }),
    'text3': new Style({ fillColor: '#111111', strokeWidth: 1, textAlign: "left", strokeColor: '#ffffff', font: '700 10px "Inter", sans-serif' }),
    'text4': new Style({ fillColor: '#444444', strokeWidth: 1, textAlign: "center", strokeColor: '#ffffff', font: '700 9px "Inter", sans-serif' }),
}