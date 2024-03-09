import Rectangle from './Rectangle';
import Point from './Point';
import AbstractCanvas2D from '../canvas/AbstractCanvas2D';
import SvgCanvas2D from '../canvas/SvgCanvas2D';
import CellState from '../cell/CellState';
import StencilShape from './node/StencilShape';
import CellOverlay from '../cell/CellOverlay';
import ImageBox from '../image/ImageBox';
import type { ArrowValue, CellStateStyle, ColorValue, DirectionValue, GradientMap } from '../../types';
/**
 * Base class for all shapes.
 * A shape in mxGraph is a separate implementation for SVG, VML and HTML.
 * Which implementation to use is controlled by the dialect property which
 * is assigned from within the mxCellRenderer when the shape is created.
 * The dialect must be assigned for a shape, and it does normally depend on
 * the browser and the configuration of the graph (see mxGraph rendering hint).
 *
 * For each supported shape in SVG and VML, a corresponding shape exists in
 * mxGraph, namely for text, image, rectangle, rhombus, ellipse and polyline.
 * The other shapes are a combination of these shapes (eg. label and swimlane)
 * or they consist of one or more (filled) path objects (eg. actor and cylinder).
 * The HTML implementation is optional but may be required for a HTML-only view
 * of the graph.
 *
 * ### Custom Shapes
 * To extend from this class, the basic code looks as follows.
 * In the special case where the custom shape consists only of one filled region
 * or one filled region and an additional stroke the mxActor and mxCylinder
 * should be subclassed, respectively.
 * ```javascript
 * function CustomShape() { }
 *
 * CustomShape.prototype = new mxShape();
 * CustomShape.prototype.constructor = CustomShape;
 * ```
 * To register a custom shape in an existing graph instance, one must register the
 * shape under a new name in the graph’s cell renderer as follows:
 * ```javascript
 * mxCellRenderer.registerShape('customShape', CustomShape);
 * ```
 * The second argument is the name of the constructor.
 * In order to use the shape you can refer to the given name above in a stylesheet.
 * For example, to change the shape for the default vertex style, the following code
 * is used:
 * ```javascript
 * var style = graph.getStylesheet().getDefaultVertexStyle();
 * style.shape = 'customShape';
 * ```
 */
declare class Shape {
    preserveImageAspect: boolean;
    overlay: CellOverlay | null;
    indicator: Shape | null;
    indicatorShape: typeof Shape | null;
    opacity: number;
    isDashed: boolean;
    fill: ColorValue;
    gradient: ColorValue;
    gradientDirection: DirectionValue;
    fillOpacity: number;
    strokeOpacity: number;
    stroke: ColorValue;
    strokeWidth: number;
    spacing: number;
    startSize: number;
    endSize: number;
    startArrow: ArrowValue | string;
    endArrow: ArrowValue | string;
    direction: DirectionValue;
    flipH: boolean;
    flipV: boolean;
    isShadow: boolean;
    isRounded: boolean;
    rotation: number;
    cursor: string;
    verticalTextRotation: number;
    oldGradients: GradientMap;
    glass: boolean;
    /**
     * Holds the dialect in which the shape is to be painted.
     * This can be one of the DIALECT constants in {@link Constants}.
     */
    dialect: string | null;
    /**
     * Holds the scale in which the shape is being painted.
     */
    scale: number;
    /**
     * Rendering hint for configuring the canvas.
     */
    antiAlias: boolean;
    /**
     * Minimum stroke width for SVG output.
     */
    minSvgStrokeWidth: number;
    /**
     * Holds the {@link Rectangle} that specifies the bounds of this shape.
     */
    bounds: Rectangle | null;
    /**
     * Holds the array of <Point> that specify the points of this shape.
     */
    points: (Point | null)[];
    /**
     * Holds the outermost DOM node that represents this shape.
     */
    node: SVGGElement;
    /**
     * Optional reference to the corresponding <CellState>.
     */
    state: CellState | null;
    /**
     * Optional reference to the style of the corresponding <CellState>.
     */
    style: CellStateStyle | null;
    /**
     * Contains the bounding box of the shape, that is, the smallest rectangle
     * that includes all pixels of the shape.
     */
    boundingBox: Rectangle | null;
    /**
     * Holds the {@link Stencil} that defines the shape.
     */
    stencil: StencilShape | null;
    /**
     * Event-tolerance for SVG strokes (in px). Default is 8. This is only passed
     * to the canvas in <createSvgCanvas> if <pointerEvents> is true.
     */
    svgStrokeTolerance: number;
    /**
     * Specifies if pointer events should be handled. Default is true.
     */
    pointerEvents: boolean;
    originalPointerEvents: boolean | null;
    /**
     * Specifies if pointer events should be handled. Default is true.
     */
    svgPointerEvents: string;
    /**
     * Specifies if pointer events outside of shape should be handled. Default
     * is false.
     */
    shapePointerEvents: boolean;
    /**
     * Specifies if pointer events outside of stencils should be handled. Default
     * is false. Set this to true for backwards compatibility with the 1.x branch.
     */
    stencilPointerEvents: boolean;
    /**
     * Specifies if the shape should be drawn as an outline. This disables all
     * fill colors and can be used to disable other drawing states that should
     * not be painted for outlines. Default is false. This should be set before
     * calling <apply>.
     */
    outline: boolean;
    /**
     * Specifies if the shape is visible. Default is true.
     */
    visible: boolean;
    /**
     * Allows to use the SVG bounding box in SVG. Default is false for performance
     * reasons.
     */
    useSvgBoundingBox: boolean;
    image: ImageBox | null;
    imageSrc: string | null;
    indicatorColor: ColorValue;
    indicatorStrokeColor: ColorValue;
    indicatorGradientColor: ColorValue;
    indicatorDirection: DirectionValue;
    indicatorImageSrc: string | null;
    constructor(stencil?: StencilShape | null);
    /**
     * Initializes the shape by creaing the DOM node using <create>
     * and adding it into the given container.
     *
     * @param container DOM node that will contain the shape.
     */
    init(container: HTMLElement | SVGElement): void;
    /**
     * Sets the styles to their default values.
     */
    initStyles(): void;
    /**
     * Returns true if HTML is allowed for this shape. This implementation always
     * returns false.
     */
    isHtmlAllowed(): boolean;
    /**
     * Returns 0, or 0.5 if <strokewidth> % 2 == 1.
     */
    getSvgScreenOffset(): number;
    /**
     * Creates and returns the DOM node(s) for the shape in
     * the given container. This implementation invokes
     * <createSvg>, <createHtml> or <createVml> depending
     * on the <dialect> and style settings.
     *
     * @param container DOM node that will contain the shape.
     */
    create(): SVGGElement;
    /**
     * Reconfigures this shape. This will update the colors etc in
     * addition to the bounds or points.
     */
    reconfigure(): void;
    /**
     * Creates and returns the SVG node(s) to represent this shape.
     */
    redraw(): void;
    /**
     * Removes all child nodes and resets all CSS.
     */
    clear(): void;
    /**
     * Updates the bounds based on the points.
     */
    updateBoundsFromPoints(): void;
    /**
     * Returns the {@link Rectangle} for the label bounds of this shape, based on the
     * given scaled and translated bounds of the shape. This method should not
     * change the rectangle in-place. This implementation returns the given rect.
     */
    getLabelBounds(rect: Rectangle): Rectangle;
    /**
     * Returns the scaled top, left, bottom and right margin to be used for
     * computing the label bounds as an {@link Rectangle}, where the bottom and right
     * margin are defined in the width and height of the rectangle, respectively.
     */
    getLabelMargins(rect: Rectangle | null): Rectangle | null;
    /**
     * Returns true if the bounds are not null and all of its variables are numeric.
     */
    checkBounds(): boolean | null;
    /**
     * Updates the SVG or VML shape.
     */
    redrawShape(): void;
    /**
     * Creates a new canvas for drawing this shape. May return null.
     */
    createCanvas(): SvgCanvas2D | null;
    /**
     * Creates and returns an <mxSvgCanvas2D> for rendering this shape.
     */
    createSvgCanvas(): SvgCanvas2D | null;
    /**
     * Destroys the given canvas which was used for drawing. This implementation
     * increments the reference counts on all shared gradients used in the canvas.
     */
    destroyCanvas(canvas: AbstractCanvas2D): void;
    /**
     * Invoked before paint is called.
     */
    beforePaint(c: AbstractCanvas2D): void;
    /**
     * Invokes after paint was called.
     */
    afterPaint(c: AbstractCanvas2D): void;
    /**
     * Generic rendering code.
     */
    paint(c: AbstractCanvas2D): void;
    /**
     * Sets the state of the canvas for drawing the shape.
     */
    configureCanvas(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Returns the bounding box for the gradient box for this shape.
     */
    getGradientBounds(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): Rectangle;
    /**
     * Sets the scale and rotation on the given canvas.
     */
    updateTransform(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Paints the vertex shape.
     */
    paintVertexShape(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Hook for subclassers. This implementation is empty.
     */
    paintBackground(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Hook for subclassers. This implementation is empty.
     */
    paintForeground(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): void;
    /**
     * Hook for subclassers. This implementation is empty.
     */
    paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void;
    /**
     * Returns the arc size for the given dimension.
     */
    getArcSize(w: number, h: number): number;
    /**
     * Paints the glass gradient effect.
     */
    paintGlassEffect(c: AbstractCanvas2D, x: number, y: number, w: number, h: number, arc: number): void;
    /**
     * Paints the given points with rounded corners.
     */
    addPoints(c: AbstractCanvas2D, pts: Point[], rounded: boolean | undefined, arcSize: number, close?: boolean, exclude?: number[], initialMove?: boolean): void;
    /**
     * Resets all styles.
     */
    resetStyles(): void;
    /**
     * Applies the style of the given <CellState> to the shape. This
     * implementation assigns the following styles to local fields:
     *
     * - <'fillColor'> => fill
     * - <'gradientColor'> => gradient
     * - <'gradientDirection'> => gradientDirection
     * - <'opacity'> => opacity
     * - {@link Constants#STYLE_FILL_OPACITY} => fillOpacity
     * - {@link Constants#STYLE_STROKE_OPACITY} => strokeOpacity
     * - <'strokeColor'> => stroke
     * - <'strokeWidth'> => strokewidth
     * - <'shadow'> => isShadow
     * - <'dashed'> => isDashed
     * - <'spacing'> => spacing
     * - <'startSize'> => startSize
     * - <'endSize'> => endSize
     * - <'rounded'> => isRounded
     * - <'startArrow'> => startArrow
     * - <'endArrow'> => endArrow
     * - <'rotation'> => rotation
     * - <'direction'> => direction
     * - <'glass'> => glass
     *
     * This keeps a reference to the <style>. If you need to keep a reference to
     * the cell, you can override this method and store a local reference to
     * state.cell or the <CellState> itself. If <outline> should be true, make
     * sure to set it before calling this method.
     *
     * @param state <CellState> of the corresponding cell.
     */
    apply(state: CellState): void;
    /**
     * Sets the cursor on the given shape.
     *
     * @param cursor The cursor to be used.
     */
    setCursor(cursor: string): void;
    /**
     * Returns the current cursor.
     */
    getCursor(): string;
    /**
     * Hook for subclassers.
     */
    isRoundable(c: AbstractCanvas2D, x: number, y: number, w: number, h: number): boolean;
    /**
     * Updates the <boundingBox> for this shape using <createBoundingBox> and
     * <augmentBoundingBox> and stores the result in <boundingBox>.
     */
    updateBoundingBox(): void;
    /**
     * Returns a new rectangle that represents the bounding box of the bare shape
     * with no shadows or strokewidths.
     */
    createBoundingBox(): Rectangle | null;
    /**
     * Augments the bounding box with the strokewidth and shadow offsets.
     */
    augmentBoundingBox(bbox: Rectangle): void;
    /**
     * Returns true if the bounds should be inverted.
     */
    isPaintBoundsInverted(): boolean;
    /**
     * Returns the rotation from the style.
     */
    getRotation(): number;
    /**
     * Returns the rotation for the text label.
     */
    getTextRotation(): number;
    /**
     * Returns the actual rotation of the shape.
     */
    getShapeRotation(): number;
    /**
     * Adds a transparent rectangle that catches all events.
     */
    createTransparentSvgRectangle(x: number, y: number, w: number, h: number): SVGRectElement;
    redrawHtmlShape(): void;
    /**
     * Sets a transparent background CSS style to catch all events.
     *
     * Paints the line shape.
     */
    setTransparentBackgroundImage(node: SVGElement): void;
    /**
     * Paints the line shape.
     */
    releaseSvgGradients(grads: GradientMap): void;
    /**
     * Destroys the shape by removing it from the DOM and releasing the DOM
     * node associated with the shape using {@link Event#release}.
     */
    destroy(): void;
}
export default Shape;
