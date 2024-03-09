import Shape from '../Shape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Rectangle from '../Rectangle';
/**
 * Extends {@link Shape} to implement an cylinder shape. If a custom shape with one filled area and an overlay path is
 * needed, then this shape's {@link redrawPath} should be overridden.
 *
 * This shape is registered under {@link mxConstants.SHAPE_CYLINDER} in {@link cellRenderer}.
 */
declare class CylinderShape extends Shape {
    constructor(bounds: Rectangle, fill: string, stroke: string, strokeWidth?: number);
    /**
     * Defines the maximum height of the top and bottom part of the cylinder shape.
     */
    maxHeight: number;
    /**
     * Sets stroke tolerance to 0 for SVG.
     */
    svgStrokeTolerance: number;
    /**
     * Redirects to redrawPath for subclasses to work.
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Redirects to redrawPath for subclasses to work.
     */
    getCylinderSize(x: number, y: number, w: number, h: number): number;
    /**
     * Draws the path for this shape.
     */
    redrawPath(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, isForeground?: boolean): void;
}
export default CylinderShape;
