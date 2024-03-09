import UrlConverter from '../../util/UrlConverter';
import Point from '../geometry/Point';
import type { AlignValue, CanvasState, ColorValue, DirectionValue, OverflowValue, TextDirectionValue, VAlignValue } from '../../types';
/**
 * Base class for all canvases. A description of the public API is available in <mxXmlCanvas2D>.
 * All color values of {@link Constants#NONE} will be converted to null in the state.
 *
 * Constructor: D
 *
 * Constructs a new abstract canvas.
 */
declare abstract class AbstractCanvas2D {
    constructor();
    /**
     * Holds the <UrlConverter> to convert image URLs.
     */
    converter: UrlConverter;
    /**
     * Holds the current state.
     */
    state: CanvasState;
    /**
     * Stack of states.
     */
    states: CanvasState[];
    /**
     * Holds the current path as an array.
     */
    path: (string | number)[];
    /**
     * Switch for rotation of HTML. Default is false.
     */
    rotateHtml: boolean;
    /**
     * Holds the last x coordinate.
     */
    lastX: number;
    /**
     * Holds the last y coordinate.
     */
    lastY: number;
    /**
     * Contains the string used for moving in paths. Default is 'M'.
     */
    moveOp: string;
    /**
     * Contains the string used for moving in paths. Default is 'L'.
     */
    lineOp: string;
    /**
     * Contains the string used for quadratic paths. Default is 'Q'.
     */
    quadOp: string;
    /**
     * Contains the string used for bezier curves. Default is 'C'.
     */
    curveOp: string;
    /**
     * Holds the operator for closing curves. Default is 'Z'.
     */
    closeOp: string;
    /**
     * Boolean value that specifies if events should be handled. Default is false.
     */
    pointerEvents: boolean;
    pointerEventsValue: string | null;
    /**
     * Create a new <UrlConverter> and returns it.
     */
    createUrlConverter(): UrlConverter;
    /**
     * Resets the state of this canvas.
     */
    reset(): void;
    /**
     * Creates the state of the this canvas.
     */
    createState(): CanvasState;
    /**
     * Rounds all numbers to integers.
     */
    format(value: number): number;
    /**
     * Adds the given operation to the path.
     */
    addOp: (op: string, ...args: number[]) => void;
    /**
     * Rotates the given point and returns the result as an {@link Point}.
     */
    rotatePoint(x: number, y: number, theta: number, cx: number, cy: number): Point;
    /**
     * Saves the current state.
     */
    save(): void;
    /**
     * Restores the current state.
     */
    restore(): void;
    /**
     * Sets the current link. Hook for subclassers.
     */
    setLink(link: string | null): void;
    /**
     * Scales the current state.
     */
    scale(value: number): void;
    /**
     * Translates the current state.
     */
    translate(dx: number, dy: number): void;
    /**
     * Rotates the current state.
     */
    rotate(theta: number, flipH: boolean, flipV: boolean, cx: number, cy: number): void;
    /**
     * Sets the current alpha.
     */
    setAlpha(value: number): void;
    /**
     * Sets the current solid fill alpha.
     */
    setFillAlpha(value: number): void;
    /**
     * Sets the current stroke alpha.
     */
    setStrokeAlpha(value: number): void;
    /**
     * Sets the current fill color.
     */
    setFillColor(value: ColorValue | null): void;
    /**
     * Sets the current gradient.
     */
    setGradient(color1: ColorValue, color2: ColorValue, x: number, y: number, w: number, h: number, direction: DirectionValue, alpha1?: number, alpha2?: number): void;
    /**
     * Sets the current stroke color.
     */
    setStrokeColor(value: ColorValue | null): void;
    /**
     * Sets the current stroke width.
     */
    setStrokeWidth(value: number): void;
    /**
     * Enables or disables dashed lines.
     */
    setDashed(value: boolean, fixDash?: boolean): void;
    /**
     * Sets the current dash pattern.
     */
    setDashPattern(value: string): void;
    /**
     * Sets the current line cap.
     */
    setLineCap(value: string): void;
    /**
     * Sets the current line join.
     */
    setLineJoin(value: string): void;
    /**
     * Sets the current miter limit.
     */
    setMiterLimit(value: number): void;
    /**
     * Sets the current font color.
     */
    setFontColor(value: ColorValue | null): void;
    /**
     * Sets the current font background color.
     */
    setFontBackgroundColor(value: ColorValue | null): void;
    /**
     * Sets the current font border color.
     */
    setFontBorderColor(value: ColorValue | null): void;
    /**
     * Sets the current font size.
     */
    setFontSize(value: number): void;
    /**
     * Sets the current font family.
     */
    setFontFamily(value: string): void;
    /**
     * Sets the current font style.
     */
    setFontStyle(value: number): void;
    /**
     * Enables or disables and configures the current shadow.
     */
    setShadow(enabled: boolean): void;
    /**
     * Enables or disables and configures the current shadow.
     */
    setShadowColor(value: ColorValue | null): void;
    /**
     * Enables or disables and configures the current shadow.
     */
    setShadowAlpha(value: number): void;
    /**
     * Enables or disables and configures the current shadow.
     */
    setShadowOffset(dx: number, dy: number): void;
    /**
     * Starts a new path.
     */
    begin(): void;
    /**
     *  Moves the current path the given coordinates.
     */
    moveTo(x: number, y: number): void;
    /**
     * Draws a line to the given coordinates. Uses moveTo with the op argument.
     */
    lineTo(x: number, y: number): void;
    /**
     * Adds a quadratic curve to the current path.
     */
    quadTo(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Adds a bezier curve to the current path.
     */
    curveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    /**
     * Adds the given arc to the current path. This is a synthetic operation that
     * is broken down into curves.
     */
    arcTo(rx: number, ry: number, angle: number, largeArcFlag: boolean, sweepFlag: boolean, x: number, y: number): void;
    /**
     * Closes the current path.
     */
    close(x1?: number, y1?: number, x2?: number, y2?: number, x3?: number, y3?: number): void;
    /**
     * Empty implementation for backwards compatibility. This will be removed.
     */
    abstract end(): void;
    abstract stroke(): void;
    abstract fill(): void;
    abstract fillAndStroke(): void;
    abstract rect(x: number, y: number, w: number, h: number): void;
    abstract roundrect(x: number, y: number, w: number, h: number, r1: number, r2: number): void;
    abstract ellipse(x: number, y: number, w: number, h: number): void;
    abstract image(x: number, y: number, w: number, h: number, src: string, aspect: boolean, flipH: boolean, flipV: boolean): void;
    abstract text(x: number, y: number, w: number, h: number, str: string, align: AlignValue, valign: VAlignValue, wrap: boolean, format: string, overflow: OverflowValue, clip: boolean, rotation: number, dir: TextDirectionValue): void;
    abstract updateText(x: number, y: number, w: number, h: number, align: AlignValue, valign: VAlignValue, wrap: boolean, overflow: OverflowValue, clip: boolean, rotation: number, node: SVGElement): void;
}
export default AbstractCanvas2D;
