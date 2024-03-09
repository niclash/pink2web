import { TEXT_DIRECTION } from '../../../util/Constants';
import Point from '../Point';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Shape from '../Shape';
import Rectangle from '../Rectangle';
import CellState from '../../cell/CellState';
import { AlignValue, ColorValue, OverflowValue, TextDirectionValue, VAlignValue } from '../../../types';
/**
 * Extends mxShape to implement a text shape.
 * To change vertical text from bottom to top to top to bottom,
 * the following code can be used:
 * ```javascript
 * mxText.prototype.verticalTextRotation = 90;
 * ```
 * @class TextShape
 * @extends {Shape}
 */
declare class TextShape extends Shape {
    constructor(value: string | HTMLElement | SVGGElement, bounds: Rectangle, align?: AlignValue, valign?: VAlignValue, color?: string, family?: string, size?: number, fontStyle?: number, spacing?: number, spacingTop?: number, spacingRight?: number, spacingBottom?: number, spacingLeft?: number, horizontal?: boolean, background?: string, border?: string, wrap?: boolean, clipped?: boolean, overflow?: OverflowValue, labelPadding?: number, textDirection?: TextDirectionValue);
    value: string | HTMLElement | SVGGElement;
    bounds: Rectangle;
    align: AlignValue;
    valign: VAlignValue;
    color: ColorValue;
    family: string;
    size: number;
    fontStyle: number;
    spacing: number;
    spacingTop: number;
    spacingRight: number;
    spacingBottom: number;
    spacingLeft: number;
    horizontal: boolean;
    background: ColorValue;
    border: ColorValue;
    wrap: boolean;
    clipped: boolean;
    overflow: OverflowValue;
    labelPadding: number;
    textDirection: TextDirectionValue;
    margin: Point | null;
    unrotatedBoundingBox: Rectangle | null;
    flipH: boolean;
    flipV: boolean;
    /**
     * Specifies the spacing to be added to the top spacing. Default is 0. Use the
     * value 5 here to get the same label positions as in mxGraph 1.x.
     */
    baseSpacingTop: number;
    /**
     * Specifies the spacing to be added to the bottom spacing. Default is 0. Use the
     * value 1 here to get the same label positions as in mxGraph 1.x.
     */
    baseSpacingBottom: number;
    /**
     * Specifies the spacing to be added to the left spacing. Default is 0.
     */
    baseSpacingLeft: number;
    /**
     * Specifies the spacing to be added to the right spacing. Default is 0.
     */
    baseSpacingRight: number;
    /**
     * Specifies if linefeeds in HTML labels should be replaced with BR tags.
     * Default is true.
     */
    replaceLinefeeds: boolean;
    /**
     * Rotation for vertical text. Default is -90 (bottom to top).
     */
    verticalTextRotation: number;
    /**
     * Specifies if the string size should be measured in <updateBoundingBox> if
     * the label is clipped and the label position is center and middle. If this is
     * true, then the bounding box will be set to <bounds>. Default is true.
     * <ignoreStringSize> has precedence over this switch.
     */
    ignoreClippedStringSize: boolean;
    /**
     * Specifies if the actual string size should be measured. If disabled the
     * boundingBox will not ignore the actual size of the string, otherwise
     * <bounds> will be used instead. Default is false.
     */
    ignoreStringSize: boolean;
    /**
     * Contains the last rendered text value. Used for caching.
     */
    lastValue: string | HTMLElement | SVGGElement | null;
    /**
     * Specifies if caching for HTML labels should be enabled. Default is true.
     */
    cacheEnabled: boolean;
    /**
     * Disables offset in IE9 for crisper image output.
     */
    getSvgScreenOffset(): number;
    /**
     * Returns true if the bounds are not null and all of its variables are numeric.
     */
    checkBounds(): boolean;
    /**
     * Generic rendering code.
     */
    paint(c: AbstractCanvas2D, update?: boolean): void;
    /**
     * Renders the text using the given DOM nodes.
     */
    redraw(): void;
    /**
     * Resets all styles.
     */
    resetStyles(): void;
    /**
     * Extends mxShape to update the text styles.
     *
     * @param state <CellState> of the corresponding cell.
     */
    apply(state: CellState): void;
    /**
     * Used to determine the automatic text direction. Returns
     * {@link Constants#TEXT_DIRECTION_LTR} or {@link Constants#TEXT_DIRECTION_RTL}
     * depending on the contents of <value>. This is not invoked for HTML, wrapped
     * content or if <value> is a DOM node.
     */
    getAutoDirection(): TEXT_DIRECTION.LTR | TEXT_DIRECTION.RTL;
    /**
     * Returns the node that contains the rendered input.
     */
    getContentNode(): SVGGElement;
    /**
     * Updates the <boundingBox> for this shape using the given node and position.
     */
    updateBoundingBox(): void;
    /**
     * Returns 0 to avoid using rotation in the canvas via updateTransform.
     */
    getShapeRotation(): number;
    /**
     * Returns the rotation for the text label of the corresponding shape.
     */
    getTextRotation(): number;
    /**
     * Inverts the bounds if {@link Shape#isBoundsInverted} returns true or if the
     * horizontal style is false.
     */
    isPaintBoundsInverted(): boolean;
    /**
     * Sets the state of the canvas for drawing the shape.
     */
    configureCanvas(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Private helper function to create SVG elements
     */
    getHtmlValue(): string;
    /**
     * Private helper function to create SVG elements
     */
    getTextCss(): string;
    /**
     * Updates the HTML node(s) to reflect the latest bounds and scale.
     */
    redrawHtmlShape(): void;
    /**
     * Sets the inner HTML of the given element to the <value>.
     */
    updateInnerHtml(elt: HTMLElement): void;
    /**
     * Updates the HTML node(s) to reflect the latest bounds and scale.
     */
    updateValue(): void;
    /**
     * Updates the HTML node(s) to reflect the latest bounds and scale.
     */
    updateFont(node: HTMLElement | SVGGElement): void;
    /**
     * Updates the HTML node(s) to reflect the latest bounds and scale.
     */
    updateSize(node: HTMLElement, enableWrap?: boolean): void;
    /**
     * Returns the spacing as an {@link Point}.
     */
    updateMargin(): void;
    /**
     * Returns the spacing as an {@link Point}.
     */
    getSpacing(): Point;
}
export default TextShape;
