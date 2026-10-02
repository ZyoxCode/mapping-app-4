import { ShapefileLayer } from "./layers/layertypes/shapefile";
import { StaticLayer } from "./layers/layertypes/static";
import { always, resolveStyle } from "./styles";
import { Style } from "./styles/classes";
import type { ZoomLevel } from "./layers/zoom-levels";
import { DEFAULT_ZOOM_LEVELS } from "./defaults";
import { capitalize } from "./labels/utils";

const waterColor = '#4f86aa';
const landColor = '#92c592';
const iceColor = '#f1f1f1';

const disputedStyle = new Style({ strokeColor: '#000000', strokeWidth: 0.5, dashed: [5, 5] }, false, true);
const textStyle = new Style({ fillColor: '#111111', strokeWidth: 1.3, strokeColor: '#ffffff', font: '700 10px "Inter", sans-serif' });
const textStyle2 = new Style({ fillColor: '#4d4d4d', strokeWidth: 1.2, strokeColor: '#ffffff', font: '700 italic 10px "Inter", sans-serif' });

const alwaysMaxDetail = [{ upperZoomBound: Infinity, areaThreshold: 0 }];

export const LAYERS = [
    new StaticLayer(
        "Ocean Background",
        [{ type: 'Polygon', coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90]]] }],
        always(new Style({
            fillColor: waterColor,
            strokeWidth: 0,
        }))
    ),
    new ShapefileLayer(
        "Land",
        'ne_10m_land',
        always(new Style({
            fillColor: landColor,
            strokeWidth: 0,
        }))
    ),
    new ShapefileLayer(
        "Glaciers",
        'ne_10m_glaciated_areas',
        always(new Style({
            fillColor: iceColor,
            strokeWidth: 0,
        }))
    ),
    new ShapefileLayer(
        "Lakes",
        'ne_10m_lakes',
        always(new Style({
            fillColor: waterColor,
            strokeWidth: 0,
        }))
    ),
    new ShapefileLayer(
        "Borders",
        'ne_10m_admin_0_boundary_lines_land',
        [
            { when: (props) => props.FEATURECLA === 'Disputed (please verify)', style: disputedStyle },
            { when: (props) => props.FEATURECLA === 'Line of control (please verify)', style: disputedStyle },
            { when: (props) => props.FEATURECLA === 'Indeterminant frontier', style: disputedStyle },
            { when: (props) => props.FEATURECLA === 'Overlay limit', style: disputedStyle },
            { when: (props) => props.FEATURECLA === 'Lease limit', style: disputedStyle },
            { when: (props) => props.FEATURECLA === 'Unrecognized', style: disputedStyle },
            { when: (props) => props.FCLASS_ISO === 'Unrecognized', style: disputedStyle },
            { when: () => true, style: new Style({ strokeColor: '#000000', strokeWidth: 0.5 }, false, true) },
        ],
    ),
    new ShapefileLayer(
        "Breakaway Borders",
        'ne_10m_admin_0_boundary_lines_disputed_areas',
        always(disputedStyle),
    ),
    new ShapefileLayer(
        'Countries',
        'ne_50m_admin_0_countries',
        always(new Style({}, false, false)),
        [
            {
                when: (props, zoom) => {
                    return zoom >= props.MIN_ZOOM && zoom >= props.MIN_LABEL && zoom <= (props.MAX_LABEL ? props.MAX_LABEL : Infinity);
                },
                text: (props, zoom) => {
                    if (props.BRK_NAME == 'China') {
                        return props.BRK_NAME;
                    }
                    if (zoom > 4) {
                        return props.NAME_EN;
                    }
                    if (props.NAME_EN.length < 15) {
                        return props.NAME_EN;
                    }
                    if (props.BRK_NAME.length < 15) {
                        return props.BRK_NAME;
                    }
                    return props.ABBREV;
                },
                style: textStyle
            },
        ],
        alwaysMaxDetail,
        true
    ),
]