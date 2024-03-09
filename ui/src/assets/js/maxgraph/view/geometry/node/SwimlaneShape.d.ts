import Shape from '../Shape';
import Rectangle from '../Rectangle';
import { ColorValue } from '../../../types';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
/**
 * Extends {@link Shape} to implement a swimlane shape.
 * This shape is registered under {@link mxConstants.SHAPE_SWIMLANE} in {@link mxCellRenderer}.
 * Use the {@link mxConstants.STYLE_STYLE_STARTSIZE} to define the size of the title
 * region, `'swimLaneFillColor'` for the content area fill,
 * `'separatorColor'` to draw an additional vertical separator and
 * {@link mxConstants.STYLE_SWIMLANE_LINE} to hide the line between the title region and
 * the content area.
 * The {@link 'horizontal'} affects the orientation of this shape,
 * not only its label.
 *
 * @class SwimlaneShape
 * @extends {Shape}
 */
declare class SwimlaneShape extends Shape {
    constructor(bounds: Rectangle, fill: ColorValue, stroke: ColorValue, strokeWidth?: number);
    /**
     * Default imagewidth and imageheight if an image but no imagewidth
     * and imageheight are defined in the style. Value is 16.
     * @type {number}
     * @default 16
     */
    imageSize: number;
    imageSrc: string | null;
    /**
     * Adds roundable support.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {boolean}
     */
    isRoundable(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): boolean;
    /**
     * Returns the bounding box for the gradient box for this shape.
     */
    getTitleSize(): number;
    /**
     * Returns the bounding box for the gradient box for this shape.
     */
    getLabelBounds(rect: Rectangle): Rectangle;
    /**
     * Returns the bounding box for the gradient box for this shape.
     */
    getGradientBounds(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): Rectangle;
    /**
     * Returns the arcsize for the swimlane.
     */
    getSwimlaneArcSize(w: number, h: number, start: number): number;
    /**
     * Paints the swimlane vertex shape.
     */
    isHorizontal(): boolean;
    /**
     * Paints the swimlane vertex shape.
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Paints the swimlane vertex shape.
     */
    paintSwimlane(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, start: number, fill: ColorValue, swimlaneLine: boolean): void;
    /**
     * Paints the swimlane vertex shape.
     */
    paintRoundedSwimlane(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, start: number, r: number, fill: ColorValue, swimlaneLine: boolean): void;
    /**
     * Paints the divider between swimlane title and content area.
     */
    paintDivider(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, start: number, shadow: boolean): void;
    /**
     * Paints the vertical or horizontal separator line between swimlanes.
     */
    paintSeparator(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, start: number, color: ColorValue): void;
    /**
     * Paints the swimlane vertex shape.
     */
    getImageBounds(x: number, y: number, w: number, h: number): Rectangle;
}
export default SwimlaneShape;
