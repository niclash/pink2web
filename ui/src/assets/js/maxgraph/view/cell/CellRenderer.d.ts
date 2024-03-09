import RectangleShape from '../geometry/node/RectangleShape';
import ImageShape from '../geometry/node/ImageShape';
import TextShape from '../geometry/node/TextShape';
import Rectangle from '../geometry/Rectangle';
import Shape from '../geometry/Shape';
import CellState from './CellState';
import CellOverlay from './CellOverlay';
/**
 * Renders cells into a document object model. The <defaultShapes> is a global
 * map of shapename, constructor pairs that is used in all instances. You can
 * get a list of all available shape names using the following code.
 *
 * In general the cell renderer is in charge of creating, redrawing and
 * destroying the shape and label associated with a cell state, as well as
 * some other graphical objects, namely controls and overlays. The shape
 * hieararchy in the display (ie. the hierarchy in which the DOM nodes
 * appear in the document) does not reflect the cell hierarchy. The shapes
 * are a (flat) sequence of shapes and labels inside the draw pane of the
 * graph view, with some exceptions, namely the HTML labels being placed
 * directly inside the graph container for certain browsers.
 *
 * ```javascript
 * MaxLog.show();
 * for (var i in mxCellRenderer.defaultShapes)
 * {
 *   MaxLog.debug(i);
 * }
 * ```
 *
 * Constructor: mxCellRenderer
 *
 * Constructs a new cell renderer with the following built-in shapes:
 * arrow, rectangle, ellipse, rhombus, image, line, label, cylinder,
 * swimlane, connector, actor and cloud.
 */
declare class CellRenderer {
    /**
     * Static array that contains the globally registered shapes which are
     * known to all instances of this class. For adding new shapes you should
     * use the static {@link CellRenderer#registerShape} function.
     */
    static defaultShapes: {
        [key: string]: typeof Shape;
    };
    /**
     * Defines the default shape for edges. Default is {@link Connector}.
     */
    defaultEdgeShape: typeof Shape;
    /**
     * Defines the default shape for vertices. Default is {@link RectangleShape}.
     */
    defaultVertexShape: typeof RectangleShape;
    /**
     * Defines the default shape for labels. Default is {@link Text}.
     */
    defaultTextShape: typeof TextShape;
    /**
     * Specifies if the folding icon should ignore the horizontal
     * orientation of a swimlane. Default is true.
     */
    legacyControlPosition: boolean;
    /**
     * Specifies if spacing and label position should be ignored if overflow is
     * fill or width. Default is true for backwards compatiblity.
     */
    legacySpacing: boolean;
    /**
     * Anti-aliasing option for new shapes. Default is true.
     */
    antiAlias: boolean;
    /**
     * Minimum stroke width for SVG output.
     */
    minSvgStrokeWidth: number;
    /**
     * Specifies if the enabled state of the graph should be ignored in the control
     * click handler (to allow folding in disabled graphs). Default is false.
     */
    forceControlClickHandler: boolean;
    /**
     * Registers the given constructor under the specified key in this instance of the renderer.
     * @example
     * ```
     * mxCellRenderer.registerShape(mxConstants.SHAPE_RECTANGLE, mxRectangleShape);
     * ```
     *
     * @param key the shape name.
     * @param shape constructor of the {@link Shape} subclass.
     */
    static registerShape(key: string, shape: typeof Shape): void;
    /**
     * Initializes the shape in the given state by calling its init method with
     * the correct container after configuring it using <configureShape>.
     *
     * @param state <CellState> for which the shape should be initialized.
     */
    initializeShape(state: CellState): void;
    /**
     * Creates and returns the shape for the given cell state.
     *
     * @param state <CellState> for which the shape should be created.
     */
    createShape(state: CellState): Shape;
    /**
     * Creates the indicator shape for the given cell state.
     *
     * @param state <CellState> for which the indicator shape should be created.
     */
    createIndicatorShape(state: CellState): void;
    /**
     * Returns the shape for the given name from <defaultShapes>.
     */
    getShape(name: string | null): typeof Shape | null;
    /**
     * Returns the constructor to be used for creating the shape.
     */
    getShapeConstructor(state: CellState): typeof Shape;
    /**
     * Configures the shape for the given cell state.
     *
     * @param state <CellState> for which the shape should be configured.
     */
    configureShape(state: CellState): void;
    /**
     * Replaces any reserved words used for attributes, eg. inherit,
     * indicated or swimlane for colors in the shape for the given state.
     * This implementation resolves these keywords on the fill, stroke
     * and gradient color keys.
     */
    postConfigureShape(state: CellState): void;
    /**
     * Resolves special keywords 'inherit', 'indicated' and 'swimlane' and sets
     * the respective color on the shape.
     */
    checkPlaceholderStyles(state: CellState): boolean;
    /**
     * Resolves special keywords 'inherit', 'indicated' and 'swimlane' and sets
     * the respective color on the shape.
     */
    resolveColor(state: CellState, field: string, key: string): void;
    /**
     * Returns the value to be used for the label.
     *
     * @param state <CellState> for which the label should be created.
     */
    getLabelValue(state: CellState): string | null;
    /**
     * Creates the label for the given cell state.
     *
     * @param state <CellState> for which the label should be created.
     */
    createLabel(state: CellState, value: string): void;
    /**
     * Initiailzes the label with a suitable container.
     *
     * @param state <CellState> whose label should be initialized.
     */
    initializeLabel(state: CellState, shape: Shape): void;
    /**
     * Creates the actual shape for showing the overlay for the given cell state.
     *
     * @param state <CellState> for which the overlay should be created.
     */
    createCellOverlays(state: CellState): void;
    /**
     * Initializes the given overlay.
     *
     * @param state <CellState> for which the overlay should be created.
     * @param overlay {@link ImageShape} that represents the overlay.
     */
    initializeOverlay(state: CellState, overlay: ImageShape): void;
    /**
     * Installs the listeners for the given <CellState>, <CellOverlay> and
     * {@link Shape} that represents the overlay.
     */
    installCellOverlayListeners(state: CellState, overlay: CellOverlay, shape: Shape): void;
    /**
     * Creates the control for the given cell state.
     *
     * @param state <CellState> for which the control should be created.
     */
    createControl(state: CellState): void;
    /**
     * Hook for creating the click handler for the folding icon.
     *
     * @param state <CellState> whose control click handler should be returned.
     */
    createControlClickHandler(state: CellState): (evt: Event) => void;
    /**
     * Initializes the given control and returns the corresponding DOM node.
     *
     * @param state <CellState> for which the control should be initialized.
     * @param control {@link Shape} to be initialized.
     * @param handleEvents Boolean indicating if mousedown and mousemove should fire events via the graph.
     * @param clickHandler Optional function to implement clicks on the control.
     */
    initControl(state: CellState, control: Shape, handleEvents: boolean, clickHandler: EventListener): Element | null;
    /**
     * Returns true if the event is for the shape of the given state. This
     * implementation always returns true.
     *
     * @param state <CellState> whose shape fired the event.
     * @param evt Mouse event which was fired.
     */
    isShapeEvent(state: CellState, evt: MouseEvent): boolean;
    /**
     * Returns true if the event is for the label of the given state. This
     * implementation always returns true.
     *
     * @param state <CellState> whose label fired the event.
     * @param evt Mouse event which was fired.
     */
    isLabelEvent(state: CellState, evt: MouseEvent): boolean;
    /**
     * Installs the event listeners for the given cell state.
     *
     * @param state <CellState> for which the event listeners should be isntalled.
     */
    installListeners(state: CellState): void;
    /**
     * Redraws the label for the given cell state.
     *
     * @param state <CellState> whose label should be redrawn.
     */
    redrawLabel(state: CellState, forced: boolean): void;
    /**
     * Returns true if the style for the text shape has changed.
     *
     * @param state <CellState> whose label should be checked.
     * @param shape {@link Text} shape to be checked.
     */
    isTextShapeInvalid(state: CellState, shape: TextShape): boolean;
    /**
     * Called to invoked redraw on the given text shape.
     *
     * @param shape {@link Text} shape to be redrawn.
     */
    redrawLabelShape(shape: TextShape): void;
    /**
     * Returns the scaling used for the label of the given state
     *
     * @param state <CellState> whose label scale should be returned.
     */
    getTextScale(state: CellState): number;
    /**
     * Returns the bounds to be used to draw the label of the given state.
     *
     * @param state <CellState> whose label bounds should be returned.
     */
    getLabelBounds(state: CellState): Rectangle;
    /**
     * Adds the shape rotation to the given label bounds and
     * applies the alignment and offsets.
     *
     * @param state <CellState> whose label bounds should be rotated.
     * @param bounds {@link Rectangle} the rectangle to be rotated.
     */
    rotateLabelBounds(state: CellState, bounds: Rectangle): void;
    /**
     * Redraws the overlays for the given cell state.
     *
     * @param state <CellState> whose overlays should be redrawn.
     */
    redrawCellOverlays(state: CellState, forced?: boolean): void;
    /**
     * Redraws the control for the given cell state.
     *
     * @param state <CellState> whose control should be redrawn.
     */
    redrawControl(state: CellState, forced?: boolean): void;
    /**
     * Returns the bounds to be used to draw the control (folding icon) of the
     * given state.
     */
    getControlBounds(state: CellState, w: number, h: number): Rectangle | null;
    /**
     * Inserts the given array of {@link Shapes} after the given nodes in the DOM.
     *
     * @param shapes Array of {@link Shapes} to be inserted.
     * @param node Node in <drawPane> after which the shapes should be inserted.
     * @param htmlNode Node in the graph container after which the shapes should be inserted that
     * will not go into the <drawPane> (eg. HTML labels without foreignObjects).
     */
    insertStateAfter(state: CellState, node: HTMLElement | SVGElement | null, htmlNode: HTMLElement | SVGElement | null): (HTMLElement | SVGElement | null)[];
    /**
     * Returns the {@link Shapes} for the given cell state in the order in which they should
     * appear in the DOM.
     *
     * @param state <CellState> whose shapes should be returned.
     */
    getShapesForState(state: CellState): [Shape | null, TextShape | null, Shape | null];
    /**
     * Updates the bounds or points and scale of the shapes for the given cell
     * state. This is called in mxGraphView.validatePoints as the last step of
     * updating all cells.
     *
     * @param state <CellState> for which the shapes should be updated.
     * @param force Optional boolean that specifies if the cell should be reconfiured
     * and redrawn without any additional checks.
     * @param rendering Optional boolean that specifies if the cell should actually
     * be drawn into the DOM. If this is false then redraw and/or reconfigure
     * will not be called on the shape.
     */
    redraw(state: CellState, force?: boolean, rendering?: boolean): void;
    /**
     * Redraws the shape for the given cell state.
     *
     * @param state <CellState> whose label should be redrawn.
     */
    redrawShape(state: CellState, force?: boolean, rendering?: boolean): boolean;
    /**
     * Invokes redraw on the shape of the given state.
     */
    doRedrawShape(state: CellState): void;
    /**
     * Returns true if the given shape must be repainted.
     */
    isShapeInvalid(state: CellState, shape: Shape): boolean;
    /**
     * Destroys the shapes associated with the given cell state.
     *
     * @param state <CellState> for which the shapes should be destroyed.
     */
    destroy(state: CellState): void;
}
export default CellRenderer;
