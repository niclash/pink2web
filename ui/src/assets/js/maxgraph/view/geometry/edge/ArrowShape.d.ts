import Shape from '../Shape';
import Rectangle from '../Rectangle';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Point from '../Point';
import { ColorValue } from '../../../types';
/**
 * Extends {@link Shape} to implement an arrow shape. The shape is used to represent edges, not vertices.
 *
 * This shape is registered under {@link mxConstants.SHAPE_ARROW} in {@link mxCellRenderer}.
 */
declare class ArrowShape extends Shape {
    constructor(points: Point[], fill: ColorValue, stroke: ColorValue, strokeWidth?: number, arrowWidth?: number, spacing?: number, endSize?: number);
    arrowWidth: number;
    /**
     * Augments the bounding box with the edge width and markers.
     */
    augmentBoundingBox(bbox: Rectangle): void;
    /**
     * Paints the line shape.
     */
    paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void;
}
export default ArrowShape;
