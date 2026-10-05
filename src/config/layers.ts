import { LabelHandler } from "../labels/classes";
import { ShapefileLayer } from "../layers/layer-types/shapefile";
import { StaticLayer } from "../layers/layer-types/static";
import { Style } from "../styles/class";
import { always } from "../styles/utils";
import { COLORS } from "./colors";
import { DEFAULT_ZOOM_LEVELS } from "./defaults";
import { STYLES } from "./styles";
import type { Marker } from '../types'

const alwaysMaxDetail = [{ upperZoomBound: Infinity, areaThreshold: 0 }];

export const LAYERS = [
    new StaticLayer(
        "Ocean Background",
        [{ type: 'Polygon', coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90]]] }],
        always(new Style({ fillColor: COLORS.water })),
        null,
        alwaysMaxDetail,
        false,
        true
    ),
    new ShapefileLayer(
        "Land",
        'ne_10m_land',
        always(new Style({ fillColor: COLORS.land })),
        null,
        DEFAULT_ZOOM_LEVELS,
        false,
        true
    ),
    new ShapefileLayer(
        "Glaciers",
        'ne_10m_glaciated_areas',
        always(new Style({ fillColor: COLORS.ice })),
        null,
        DEFAULT_ZOOM_LEVELS,
        false,
        true
    ),
    new ShapefileLayer(
        "Lakes",
        'ne_10m_lakes',
        always(new Style({ fillColor: COLORS.water }))
    ),
    new ShapefileLayer(
        "Borders",
        'ne_10m_admin_0_boundary_lines_land',
        [
            { when: (props) => props.FEATURECLA === 'Disputed (please verify)', style: STYLES.disputed },
            { when: (props) => props.FEATURECLA === 'Line of control (please verify)', style: STYLES.disputed },
            { when: (props) => props.FEATURECLA === 'Indeterminant frontier', style: STYLES.disputed },
            { when: (props) => props.FEATURECLA === 'Overlay limit', style: STYLES.disputed },
            { when: (props) => props.FEATURECLA === 'Lease limit', style: STYLES.disputed },
            { when: (props) => props.FEATURECLA === 'Unrecognized', style: STYLES.disputed },
            { when: (props) => props.FCLASS_ISO === 'Unrecognized', style: STYLES.disputed },
            { when: () => true, style: new Style({ strokeColor: '#000000', strokeWidth: 0.5 }) },
        ],
        null,
        DEFAULT_ZOOM_LEVELS,
        false,
        true
    ),
    new ShapefileLayer(
        'Countries',
        'ne_50m_admin_0_countries',
        always(new Style({})),
        new LabelHandler(
            [

                (props) => props.NAME_EN,
                (props) => props.BRK_NAME,
                (props) => props.ABBREV,
            ],
            (props, zoom) => {
                if (props.BRK_NAME == 'China') {
                    return 1
                }
                if (zoom > 4) {
                    return 0
                }
                if (props.NAME_EN.length < 15) {
                    return 0
                }
                if (props.BRK_NAME.length < 15) {
                    return 1
                }
                return 2
            },
            [
                { when: (props, zoom) => zoom > 4 && props.HOMEPART == 1 || props.LABELRANK < 2, style: STYLES.text1large },
                { when: (props, zoom) => zoom > 4 && props.HOMEPART == 1, style: STYLES.text1med },
                { when: () => true, style: STYLES.text1 },
            ],
            null,
            0,
            13
        ),
        alwaysMaxDetail,
        false,
        true
    ),
    new ShapefileLayer(
        'Populated Places',
        'ne_10m_populated_places',
        always(new Style({})),
        new LabelHandler(
            [
                (props) => props.NAME
            ],
            () => 0,
            [
                { when: () => true, style: STYLES.text3 },
            ],
            { radii: [3, 1.5], gap: 1 },
            5
        ),
        alwaysMaxDetail,
        false,
        true
    ),
    new ShapefileLayer(
        'States/Provinces',
        'ne_10m_admin_1_states_provinces',
        always(new Style({})),
        new LabelHandler(
            [
                (props) => props.NAME_EN,
                (props) => props.postal,
            ],
            (props, zoom) => {
                if (zoom > 5) {
                    return 0;
                } else {
                    return 1;
                }
            },
            [
                { when: () => true, style: STYLES.text4 },
            ],
            null,
            3
        ),
        DEFAULT_ZOOM_LEVELS,
        false,
        true
    ),
    new ShapefileLayer(
        'States/Provinces',
        'ne_10m_admin_1_states_provinces_lines',
        always(STYLES.disputed),
        null,
        alwaysMaxDetail,
        false,
        true
    ),
]