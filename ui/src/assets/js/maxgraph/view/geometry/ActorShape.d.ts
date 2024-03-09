import Rectangle from './Rectangle';
import Shape from './Shape';
import SvgCanvas2D from '../canvas/SvgCanvas2D';
import { ColorValue } from '../../types';
/**
 * Extends {@link Shape} to implement an actor shape. If a custom shape with one
 * filled area is needed, then this shape's {@link redrawPath} method should be overridden.
 *
 * This shape is registered under {@link Constants.SHAPE_ACTOR} in {@link cellRenderer}.
 *
 * ```javascript
 * function SampleShape() { }
 *
 * SampleShape.prototype = new mxActor();
 * SampleShape.prototype.constructor = vsAseShape;
 *
 * mxCellRenderer.registerShape('sample', SampleShape);
 * SampleShape.prototype.redrawPath = function(path, x, y, w, h)
 * {
 *   path.moveTo(0, 0);
 *   path.lineTo(w, h);
 *   // ...
 *   path.close();
 * }
 * ```
 */
declare class ActorShape extends Shape {
    constructor(bounds?: Rectangle | null, fill?: ColorValue, stroke?: ColorValue, strokeWidth?: number);
    /**
     * Redirects to redrawPath for subclasses to work.
     */
    paintVertexShape(c: SvgCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Draws the path for this shape.
     */
    redrawPath(c: SvgCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default ActorShape;
