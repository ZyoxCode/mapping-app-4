import { ShapefileLayer } from "./layers/layertypes/shapefile";
import { StaticLayer } from "./layers/layertypes/static";
import { always } from "./style";
import { Style } from "./style/classes";

const waterColor = 'rgb(69, 150, 197)';
const landColor = '#93c097';
const iceColor = '#f1f1f1';

export const LAYERS = [
    new StaticLayer(
        "Ocean Background",
        [[[[-180, -90], [180, -90], [180, 90], [-180, 90]]]],
        'Polygon',
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
        always(new Style({
            strokeColor: waterColor,
            strokeWidth: 1,
        }))
    ),
]