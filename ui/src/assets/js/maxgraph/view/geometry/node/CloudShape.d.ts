import ActorShape from '../ActorShape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Rectangle from '../Rectangle';
/**
 * Extends {@link ActorShape} to implement a cloud shape.
 *
 * This shape is registered under {@link mxConstants.SHAPE_CLOUD} in {@link cellRenderer}.
 */
declare class CloudShape extends ActorShape {
    constructor(bounds: Rectangle, fill: string, stroke: string, strokeWidth?: number);
    /**
     * Draws the path for this shape.
     */
    redrawPath(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default CloudShape;
