import Shape from '../Shape';
import AbstractCanvas2D from '../../../view/canvas/AbstractCanvas2D';
import Rectangle from '../Rectangle';
/**
 * Extends mxShape to implement an ellipse shape.
 * This shape is registered under mxConstants.SHAPE_ELLIPSE in mxCellRenderer.
 */
declare class EllipseShape extends Shape {
    constructor(bounds: Rectangle, fill: string, stroke: string, strokeWidth?: number);
    /**
     * Paints the ellipse shape.
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default EllipseShape;
