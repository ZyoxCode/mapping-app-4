import { ShapefileLayer } from "./layers/layertypes/shapefile";
import { StaticLayer } from "./layers/layertypes/static";
import { Style } from "./style/classes";

const waterColor = '#5a7896';
const landColor = '#93c097';

export const LAYERS = [
    new StaticLayer(
        "Ocean Background",
        [[[[-180, -90], [180, -90], [180, 90], [-180, 90]]]],
        'Polygon',
        new Style({
            fillColor: waterColor,
            strokeWidth: 0,
        })
    ),
    new ShapefileLayer(
        "Land",
        'ne_110m_land',
        new Style({
            fillColor: landColor,
            strokeWidth: 0,
        }),
    ),
]