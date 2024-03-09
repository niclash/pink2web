import ActorShape from '../ActorShape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
/**
 * Implementation of the hexagon shape.
 * @class HexagonShape
 * @extends {ActorShape}
 */
declare class HexagonShape extends ActorShape {
    constructor();
    /**
     * Draws the path for this shape.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    redrawPath(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default HexagonShape;
