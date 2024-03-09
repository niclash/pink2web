import Rectangle from '../Rectangle';
import RectangleShape from './RectangleShape';
import { ColorValue } from '../../../types';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
/**
 * Extends {@link Shape} to implement an image shape with a label.
 * This shape is registered under {@link Constants#SHAPE_LABEL} in
 * {@link CellRenderer}.
 *
 * Constructor: mxLabel
 *
 * Constructs a new label shape.
 *
 * @param bounds {@link Rectangle} that defines the bounds. This is stored in
 * {@link Shape#bounds}.
 * @param fill String that defines the fill color. This is stored in <fill>.
 * @param stroke String that defines the stroke color. This is stored in <stroke>.
 * @param strokewidth Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
declare class LabelShape extends RectangleShape {
    constructor(bounds: Rectangle, fill: ColorValue, stroke: ColorValue, strokeWidth: number);
    /**
     * Default width and height for the image.
     * @default mxConstants.DEFAULT_IMAGESIZE
     */
    imageSize: number;
    imageSrc: string | null;
    /**
     * Default value for image spacing
     * @type {number}
     * @default 2
     */
    spacing: number;
    /**
     * Default width and height for the indicicator.
     * @type {number}
     * @default 10
     */
    indicatorSize: number;
    /**
     * Default spacing between image and indicator
     * @default 2
     * @type {number}
     */
    indicatorSpacing: number;
    indicatorImageSrc: string | null;
    /**
     * Initializes the shape and the <indicator>.
     */
    init(container: SVGElement): void;
    /**
     * Reconfigures this shape. This will update the colors of the indicator
     * and reconfigure it if required.
     */
    redraw(): void;
    /**
     * Returns true for non-rounded, non-rotated shapes with no glass gradient and
     * no indicator shape.
     */
    isHtmlAllowed(): boolean;
    /**
     * Generic background painting implementation.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    paintForeground(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Generic background painting implementation.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    paintImage(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Generic background painting implementation.
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    getImageBounds(x: number, y: number, w: number, h: number): Rectangle;
    /**
     * Generic background painting implementation.
     * @param {mxAbstractCanvas2D} c
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    paintIndicator(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Generic background painting implementation.
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {Rectangle}
     */
    getIndicatorBounds(x: number, y: number, w: number, h: number): Rectangle;
    /**
     * Generic background painting implementation.
     */
    redrawHtmlShape(): void;
}
export default LabelShape;
