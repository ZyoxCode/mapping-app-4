import { ShapefileLayer } from "./layers/layertypes/shapefile";
import { StaticLayer } from "./layers/layertypes/static";
import { always } from "./styles";
import { Style } from "./styles/classes";
import { capitalize } from "./labels/utils";

const waterColor = '#4f86aa';
const landColor = '#92c592';
const iceColor = '#f1f1f1';

const disputedStyle = new Style({ strokeColor: '#000000', strokeWidth: 0.5, dashed: [5, 5] });
const textStyle = new Style({ fillColor: '#111111', strokeWidth: 1.3, strokeColor: '#ffffff', font: '700 11px "Inter", sans-serif' });
const textStyle2 = new Style({ fillColor: '#4d4d4d', strokeWidth: 1.2, strokeColor: '#ffffff', font: '700 italic 11px "Inter", sans-serif' });
const textStyle3 = new Style({ fillColor: '#111111', strokeWidth: 1.2, textAlign: "left", strokeColor: '#ffffff', font: '700 9px "Inter", sans-serif', pointRadii: [3, 1.5] });

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
            { when: () => true, style: new Style({ strokeColor: '#000000', strokeWidth: 0.5 }) },
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
        always(new Style({})),
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
    ),
    new ShapefileLayer(
        'Geography Regions',
        'ne_10m_geography_regions_polys',
        always(new Style({})),
        [
            {
                when: (props, zoom) => {
                    if (props.FEATURECLA != "Continent") {
                        return props.MIN_LABEL + 3 <= zoom && zoom <= props.MAX_LABEL + 3;
                    } else {
                        return props.MIN_LABEL <= zoom && zoom <= props.MAX_LABEL;
                    }
                },
                text: (props) => props.FEATURECLA === "Continent" ? capitalize(props.NAME_EN) : props.NAME_EN,
                style: textStyle2,
                priorityOffset: 2,
            }
        ],

        alwaysMaxDetail,
    ),
    new ShapefileLayer(
        'Populated Places',
        'ne_110m_populated_places_simple',
        always(new Style({})),
        [
            {
                when: (props, zoom) => {
                    return props.min_zoom <= zoom;
                },
                text: (props) => props.name,
                style: textStyle3,
                priorityOffset: 2,
            }
        ],
        alwaysMaxDetail,
        true
    ),
]
