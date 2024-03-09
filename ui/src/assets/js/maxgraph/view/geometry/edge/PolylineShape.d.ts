import Shape from '../Shape';
import Point from '../Point';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import { ColorValue } from '../../../types';
/**
 * Extends {@link Shape} to implement a polyline (a line with multiple points).
 * This shape is registered under {@link Constants#SHAPE_POLYLINE} in
 * {@link CellRenderer}.
 *
 * Constructor: mxPolyline
 *
 * Constructs a new polyline shape.
 *
 * @param points Array of <Point> that define the points. This is stored in
 * {@link Shape#points}.
 * @param stroke String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * @param strokewidth Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
declare class PolylineShape extends Shape {
    constructor(points: Point[], stroke: ColorValue, strokeWidth?: number);
    /**
     * Returns 0.
     */
    getRotation(): number;
    /**
     * Returns 0.
     */
    getShapeRotation(): number;
    /**
     * Returns false.
     */
    isPaintBoundsInverted(): boolean;
    /**
     * Paints the line shape.
     */
    paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void;
    /**
     * Paints the line shape.
     */
    paintLine(c: AbstractCanvas2D, pts: Point[], rounded?: boolean): void;
    /**
     * Paints the line shape.
     */
    paintCurvedLine(c: AbstractCanvas2D, pts: Point[]): void;
}
export default PolylineShape;
