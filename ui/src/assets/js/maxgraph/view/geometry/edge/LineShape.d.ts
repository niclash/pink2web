import Shape from '../Shape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Rectangle from '../Rectangle';
import { ColorValue } from '../../../types';
/**
 * Extends {@link Shape} to implement a horizontal line shape.
 * This shape is registered under {@link mxConstants.SHAPE_LINE} in {@link mxCellRenderer}.
 * @class Line
 * @extends {Shape}
 */
declare class LineShape extends Shape {
    constructor(bounds: Rectangle, stroke: ColorValue, strokeWidth?: number, vertical?: boolean);
    /**
     * Whether to paint a vertical line.
     */
    vertical: boolean;
    /**
     * Redirects to redrawPath for subclasses to work.
     * @param {AbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default LineShape;
