import Shape from '../Shape';
import Rectangle from '../Rectangle';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
/**
 * Extends {@link Shape} to implement a rhombus (aka diamond) shape.
 * This shape is registered under {@link mxConstants.SHAPE_RHOMBUS} in {@link cellRenderer}.
 * @class RhombusShape
 * @extends {Shape}
 */
declare class RhombusShape extends Shape {
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth?: number);
    /**
     * Adds roundable support.
     */
    isRoundable(): boolean;
    /**
     * Generic painting implementation.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default RhombusShape;
