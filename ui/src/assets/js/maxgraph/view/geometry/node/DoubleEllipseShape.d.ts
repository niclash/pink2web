import Rectangle from '../Rectangle';
import Shape from '../Shape';
import AbstractCanvas2D from '../../../view/canvas/AbstractCanvas2D';
/**
 * Extends {@link Shape} to implement a double ellipse shape.
 *
 * This shape is registered under {@link mxConstants.SHAPE_DOUBLE_ELLIPSE} in {@link cellRenderer}.
 *
 * Use the following override to only fill the inner ellipse in this shape:
 * ```javascript
 * mxDoubleEllipse.prototype.paintVertexShape = function(c, x, y, w, h)
 * {
 *   c.ellipse(x, y, w, h);
 *   c.stroke();
 *
 *   var inset = mxUtils.getValue(this.style, 'margin', Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5)));
 *   x += inset;
 *   y += inset;
 *   w -= 2 * inset;
 *   h -= 2 * inset;
 *
 *   if (w > 0 && h > 0)
 *   {
 *     c.ellipse(x, y, w, h);
 *   }
 *
 *   c.fillAndStroke();
 * };
 * ```
 */
declare class DoubleEllipseShape extends Shape {
    constructor(bounds: Rectangle, fill: string, stroke: string, strokeWidth?: number);
    /**
     * Paints the background.
     */
    paintBackground(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Paints the foreground.
     */
    paintForeground(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * @returns the bounds for the label.
     */
    getLabelBounds(rect: Rectangle): Rectangle;
}
export default DoubleEllipseShape;
