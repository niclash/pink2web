import PolylineShape from './PolylineShape';
import Point from '../Point';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Rectangle from '../Rectangle';
import { ColorValue } from '../../../types';
/**
 * Extends {@link mxShape} to implement a connector shape.
 * The connector shape allows for arrow heads on either side.
 * This shape is registered under {@link mxConstants.SHAPE_CONNECTOR} in {@link mxCellRenderer}.
 *
 * @class ConnectorShape
 * @extends {PolylineShape}
 */
declare class ConnectorShape extends PolylineShape {
    constructor(points: Point[], stroke: ColorValue, strokewidth: number);
    /**
     * Updates the <boundingBox> for this shape using <createBoundingBox>
     * and augmentBoundingBox and stores the result in <boundingBox>.
     */
    updateBoundingBox(): void;
    /**
     * Paints the line shape.
     */
    paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void;
    /**
     * Prepares the marker by adding offsets in pts and returning a function to paint the marker.
     */
    createMarker(c: AbstractCanvas2D, pts: Point[], source: boolean): any;
    /**
     * Augments the bounding box with the strokewidth and shadow offsets.
     */
    augmentBoundingBox(bbox: Rectangle): void;
}
export default ConnectorShape;
