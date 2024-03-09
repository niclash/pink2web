import RectangleShape from './RectangleShape';
import Rectangle from '../Rectangle';
import CellState from '../../cell/CellState';
import AbstractCanvas2D from '../../canvas/SvgCanvas2D';
import CellOverlay from '../../cell/CellOverlay';
import { ColorValue } from '../../../types';
/**
 * Extends {@link mxShape} to implement an image shape.
 * This shape is registered under {@link mxConstants.SHAPE_IMAGE} in {@link cellRenderer}.
 *
 * @class ImageShape
 * @extends {RectangleShape}
 */
declare class ImageShape extends RectangleShape {
    constructor(bounds: Rectangle, imageSrc: string, fill?: ColorValue, stroke?: ColorValue, strokeWidth?: number);
    shadow: boolean;
    imageSrc: string;
    overlay: CellOverlay | null;
    /**
     * Switch to preserve image aspect. Default is true.
     * @default true
     */
    preserveImageAspect: boolean;
    /**
     * Disables offset in IE9 for crisper image output.
     */
    getSvgScreenOffset(): number;
    /**
     * Overrides {@link mxShape.apply} to replace the fill and stroke colors with the
     * respective values from {@link 'imageBackground'} and
     * {@link 'imageBorder'}.
     *
     * Applies the style of the given {@link CellState} to the shape. This
     * implementation assigns the following styles to local fields:
     *
     * - {@link 'imageBackground'} => fill
     * - {@link 'imageBorder'} => stroke
     *
     * @param {CellState} state   {@link CellState} of the corresponding cell.
     */
    apply(state: CellState): void;
    /**
     * Returns true if HTML is allowed for this shape. This implementation always
     * returns false.
     */
    isHtmlAllowed(): boolean;
    /**
     * Creates and returns the HTML DOM node(s) to represent
     * this shape. This implementation falls back to <createVml>
     * so that the HTML creation is optional.
     */
    createHtml(): HTMLDivElement;
    /**
     * Disables inherited roundable support.
     */
    isRoundable(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): boolean;
    /**
     * Generic background painting implementation.
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
}
export default ImageShape;
