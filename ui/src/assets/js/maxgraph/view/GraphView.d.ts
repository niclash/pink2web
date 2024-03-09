import Point from './geometry/Point';
import Rectangle from './geometry/Rectangle';
import Dictionary from '../util/Dictionary';
import EventSource from './event/EventSource';
import RectangleShape from './geometry/node/RectangleShape';
import CellState from './cell/CellState';
import ImageShape from './geometry/node/ImageShape';
import Cell from './cell/Cell';
import Image from './image/ImageBox';
import Shape from './geometry/Shape';
import Geometry from './geometry/Geometry';
import ConnectionConstraint from './other/ConnectionConstraint';
import type { Graph } from './Graph';
import type { EdgeStyleFunction, MouseEventListener } from '../types';
/**
 * @class GraphView
 * @extends {EventSource}
 *
 * Extends {@link EventSource} to implement a view for a graph. This class is in
 * charge of computing the absolute coordinates for the relative child
 * geometries, the points for perimeters and edge styles and keeping them
 * cached in {@link CellState}s for faster retrieval. The states are updated
 * whenever the model or the view state (translate, scale) changes. The scale
 * and translate are honoured in the bounds.
 *
 * #### Event: mxEvent.UNDO
 *
 * Fires after the root was changed in {@link setCurrentRoot}. The `edit`
 * property contains the {@link UndoableEdit} which contains the
 * {@link CurrentRootChange}.
 *
 * #### Event: mxEvent.SCALE_AND_TRANSLATE
 *
 * Fires after the scale and translate have been changed in {@link scaleAndTranslate}.
 * The `scale`, `previousScale`, `translate`
 * and `previousTranslate` properties contain the new and previous
 * scale and translate, respectively.
 *
 * #### Event: mxEvent.SCALE
 *
 * Fires after the scale was changed in {@link setScale}. The `scale` and
 * `previousScale` properties contain the new and previous scale.
 *
 * #### Event: mxEvent.TRANSLATE
 *
 * Fires after the translate was changed in {@link setTranslate}. The
 * `translate` and `previousTranslate` properties contain
 * the new and previous value for translate.
 *
 * #### Event: mxEvent.DOWN and mxEvent.UP
 *
 * Fire if the current root is changed by executing an {@link CurrentRootChange}.
 * The event name depends on the location of the root in the cell hierarchy
 * with respect to the current root. The `root` and
 * `previous` properties contain the new and previous root,
 * respectively.
 */
export declare class GraphView extends EventSource {
    constructor(graph: Graph);
    backgroundImage: ImageShape | null;
    backgroundPageShape: Shape | null;
    EMPTY_POINT: Point;
    canvas: SVGElement | HTMLElement;
    backgroundPane: SVGElement | HTMLElement;
    drawPane: SVGElement | HTMLElement;
    overlayPane: SVGElement | HTMLElement;
    decoratorPane: SVGElement | HTMLElement;
    /**
     * Specifies the resource key for the status message after a long operation.
     * If the resource for this key does not exist then the value is used as
     * the status message. Default is 'done'.
     */
    doneResource: string;
    /**
     * Specifies the resource key for the status message while the document is
     * being updated. If the resource for this key does not exist then the
     * value is used as the status message. Default is 'updatingDocument'.
     */
    updatingDocumentResource: string;
    /**
     * Specifies if string values in cell styles should be evaluated using
     * {@link eval}. This will only be used if the string values can't be mapped
     * to objects using {@link StyleRegistry}. Default is false. NOTE: Enabling this
     * switch carries a possible security risk.
     */
    allowEval: boolean;
    /**
     * Specifies if a gesture should be captured when it goes outside of the
     * graph container. Default is true.
     */
    captureDocumentGesture: boolean;
    /**
     * Specifies if shapes should be created, updated and destroyed using the
     * methods of {@link cellRenderer} in {@link graph}. Default is true.
     */
    rendering: boolean;
    /**
     * Reference to the enclosing {@link graph}.
     */
    graph: Graph;
    /**
     * {@link Cell} that acts as the root of the displayed cell hierarchy.
     */
    currentRoot: Cell | null;
    graphBounds: Rectangle;
    scale: number;
    /**
     * {@link Point} that specifies the current translation. Default is a new
     * empty {@link Point}.
     */
    translate: Point;
    states: Dictionary<Cell, CellState>;
    /**
     * Specifies if the style should be updated in each validation step. If this
     * is false then the style is only updated if the state is created or if the
     * style of the cell was changed. Default is false.
     */
    updateStyle: boolean;
    /**
     * During validation, this contains the last DOM node that was processed.
     */
    lastNode: HTMLElement | SVGElement | null;
    /**
     * During validation, this contains the last HTML DOM node that was processed.
     */
    lastHtmlNode: HTMLElement | SVGElement | null;
    /**
     * During validation, this contains the last edge's DOM node that was processed.
     */
    lastForegroundNode: HTMLElement | SVGElement | null;
    /**
     * During validation, this contains the last edge HTML DOM node that was processed.
     */
    lastForegroundHtmlNode: HTMLElement | SVGElement | null;
    /**
     * Returns {@link graphBounds}.
     */
    getGraphBounds(): Rectangle;
    /**
     * Sets {@link graphBounds}.
     */
    setGraphBounds(value: Rectangle): void;
    /**
     * Returns the {@link scale}.
     */
    getScale(): number;
    /**
     * Sets the scale and fires a {@link scale} event before calling {@link revalidate} followed
     * by {@link graph.sizeDidChange}.
     *
     * @param value Decimal value that specifies the new scale (1 is 100%).
     */
    setScale(value: number): void;
    /**
     * Returns the {@link translate}.
     */
    getTranslate(): Point;
    isRendering(): boolean;
    setRendering(value: boolean): void;
    /**
     * Sets the translation and fires a {@link translate} event before calling
     * {@link revalidate} followed by {@link graph.sizeDidChange}. The translation is the
     * negative of the origin.
     *
     * @param dx X-coordinate of the translation.
     * @param dy Y-coordinate of the translation.
     */
    setTranslate(dx: number, dy: number): void;
    isAllowEval(): boolean;
    setAllowEval(value: boolean): void;
    /**
     * Returns {@link states}.
     */
    getStates(): Dictionary<Cell, CellState>;
    /**
     * Sets {@link states}.
     */
    setStates(value: Dictionary<Cell, CellState>): void;
    /**
     * Returns the DOM node that contains the background-, draw- and
     * overlay- and decoratorpanes.
     */
    getCanvas(): HTMLElement | SVGElement;
    /**
     * Returns the DOM node that represents the background layer.
     */
    getBackgroundPane(): HTMLElement | SVGElement;
    /**
     * Returns the DOM node that represents the main drawing layer.
     */
    getDrawPane(): HTMLElement | SVGElement;
    /**
     * Returns the DOM node that represents the layer above the drawing layer.
     */
    getOverlayPane(): HTMLElement | SVGElement;
    /**
     * Returns the DOM node that represents the topmost drawing layer.
     */
    getDecoratorPane(): HTMLElement | SVGElement;
    /**
     * Returns the union of all {@link mxCellStates} for the given array of {@link Cell}.
     *
     * @param cells Array of {@link Cell} whose bounds should be returned.
     */
    getBounds(cells: Cell[]): Rectangle | null;
    /**
     * Sets and returns the current root and fires an {@link undo} event before
     * calling {@link graph.sizeDidChange}.
     *
     * @param root {@link mxCell} that specifies the root of the displayed cell hierarchy.
     */
    setCurrentRoot(root: Cell | null): Cell | null;
    /**
     * Sets the scale and translation and fires a {@link scale} and {@link translate} event
     * before calling {@link revalidate} followed by {@link graph.sizeDidChange}.
     *
     * @param scale Decimal value that specifies the new scale (1 is 100%).
     * @param dx X-coordinate of the translation.
     * @param dy Y-coordinate of the translation.
     */
    scaleAndTranslate(scale: number, dx: number, dy: number): void;
    /**
     * Invoked after {@link scale} and/or {@link translate} has changed.
     */
    viewStateChanged(): void;
    /**
     * Clears the view if {@link currentRoot} is not null and revalidates.
     */
    refresh(): void;
    /**
     * Revalidates the complete view with all cell states.
     */
    revalidate(): void;
    /**
     * Removes the state of the given cell and all descendants if the given
     * cell is not the current root.
     *
     * @param cell Optional {@link Cell} for which the state should be removed. Default
     * is the root of the model.
     * @param force Boolean indicating if the current root should be ignored for
     * recursion.
     */
    clear(cell?: Cell | null, force?: boolean, recurse?: boolean): void;
    /**
     * Invalidates the state of the given cell, all its descendants and
     * connected edges.
     *
     * @param cell Optional {@link Cell} to be invalidated. Default is the root of the
     * model.
     */
    invalidate(cell?: Cell | null, recurse?: boolean, includeEdges?: boolean): void;
    /**
     * Calls {@link validateCell} and {@link validateCellState} and updates the {@link graphBounds}
     * using {@link getBoundingBox}. Finally the background is validated using
     * {@link validateBackground}.
     *
     * @param cell Optional {@link Cell} to be used as the root of the validation.
     * Default is {@link currentRoot} or the root of the model.
     */
    validate(cell?: Cell | null): void;
    /**
     * Returns the bounds for an empty graph. This returns a rectangle at
     * {@link translate} with the size of 0 x 0.
     */
    getEmptyBounds(): Rectangle;
    /**
     * Returns the bounding box of the shape and the label for the given
     * {@link CellState} and its children if recurse is true.
     *
     * @param state {@link CellState} whose bounding box should be returned.
     * @param recurse Optional boolean indicating if the children should be included.
     * Default is true.
     */
    getBoundingBox(state?: CellState | null, recurse?: boolean): Rectangle | null;
    /**
     * Creates and returns the shape used as the background page.
     *
     * @param bounds {@link mxRectangle} that represents the bounds of the shape.
     */
    createBackgroundPageShape(bounds: Rectangle): RectangleShape;
    /**
     * Calls {@link validateBackgroundImage} and {@link validateBackgroundPage}.
     */
    validateBackground(): void;
    /**
     * Validates the background image.
     */
    validateBackgroundImage(): void;
    /**
     * Validates the background page.
     */
    validateBackgroundPage(): void;
    /**
     * Returns the bounds for the background page.
     */
    getBackgroundPageBounds(): Rectangle;
    /**
     * Updates the bounds and redraws the background image.
     *
     * Example:
     *
     * If the background image should not be scaled, this can be replaced with
     * the following.
     *
     * @example
     * ```javascript
     * redrawBackground(backgroundImage, bg)
     * {
     *   backgroundImage.bounds.x = this.translate.x;
     *   backgroundImage.bounds.y = this.translate.y;
     *   backgroundImage.bounds.width = bg.width;
     *   backgroundImage.bounds.height = bg.height;
     *
     *   backgroundImage.redraw();
     * };
     * ```
     *
     * @param backgroundImage {@link mxImageShape} that represents the background image.
     * @param bg {@link mxImage} that specifies the image and its dimensions.
     */
    redrawBackgroundImage(backgroundImage: ImageShape, bg: Image): void;
    /**
     * Recursively creates the cell state for the given cell if visible is true and
     * the given cell is visible. If the cell is not visible but the state exists
     * then it is removed using {@link removeState}.
     *
     * @param cell {@link mxCell} whose {@link CellState} should be created.
     * @param visible Optional boolean indicating if the cell should be visible. Default
     * is true.
     */
    validateCell(cell: Cell, visible?: boolean): Cell;
    /**
     * Validates and repaints the {@link CellState} for the given {@link Cell}.
     *
     * @param cell {@link mxCell} whose {@link CellState} should be validated.
     * @param recurse Optional boolean indicating if the children of the cell should be
     * validated. Default is true.
     */
    validateCellState(cell: Cell | null, recurse?: boolean): CellState | null;
    /**
     * Updates the given {@link CellState}.
     *
     * @param state {@link CellState} to be updated.
     */
    updateCellState(state: CellState): void;
    /**
     * Validates the given cell state.
     */
    updateVertexState(state: CellState, geo: Geometry): void;
    /**
     * Validates the given cell state.
     */
    updateEdgeState(state: CellState, geo: Geometry): void;
    /**
     * Updates the absoluteOffset of the given vertex cell state. This takes
     * into account the label position styles.
     *
     * @param state {@link CellState} whose absolute offset should be updated.
     */
    updateVertexLabelOffset(state: CellState): void;
    /**
     * Resets the current validation state.
     */
    resetValidationState(): void;
    /**
     * Invoked when a state has been processed in {@link validatePoints}. This is used
     * to update the order of the DOM nodes of the shape.
     *
     * @param state {@link CellState} that represents the cell state.
     */
    stateValidated(state: CellState): void;
    /**
     * Sets the initial absolute terminal points in the given state before the edge
     * style is computed.
     *
     * @param edge {@link CellState} whose initial terminal points should be updated.
     * @param source {@link CellState} which represents the source terminal.
     * @param target {@link CellState} which represents the target terminal.
     */
    updateFixedTerminalPoints(edge: CellState, source: CellState | null, target: CellState | null): void;
    /**
     * Sets the fixed source or target terminal point on the given edge.
     *
     * @param edge <CellState> whose terminal point should be updated.
     * @param terminal <CellState> which represents the actual terminal.
     * @param source Boolean that specifies if the terminal is the source.
     * @param constraint {@link ConnectionConstraint} that specifies the connection.
     */
    updateFixedTerminalPoint(edge: CellState, terminal: CellState | null, source: boolean, constraint: ConnectionConstraint): void;
    /**
     * Returns the fixed source or target terminal point for the given edge.
     *
     * @param edge <CellState> whose terminal point should be returned.
     * @param terminal <CellState> which represents the actual terminal.
     * @param source Boolean that specifies if the terminal is the source.
     * @param constraint {@link ConnectionConstraint} that specifies the connection.
     */
    getFixedTerminalPoint(edge: CellState, terminal: CellState | null, source: boolean, constraint: ConnectionConstraint | null): Point | null;
    /**
     * Updates the bounds of the given cell state to reflect the bounds of the stencil
     * if it has a fixed aspect and returns the previous bounds as an {@link Rectangle} if
     * the bounds have been modified or null otherwise.
     *
     * @param edge {@link CellState} whose bounds should be updated.
     */
    updateBoundsFromStencil(state: CellState | null): Rectangle | null;
    /**
     * Updates the absolute points in the given state using the specified array
     * of {@link Point} as the relative points.
     *
     * @param edge {@link CellState} whose absolute points should be updated.
     * @param points Array of {@link Point} that constitute the relative points.
     * @param source {@link CellState} that represents the source terminal.
     * @param target {@link CellState} that represents the target terminal.
     */
    updatePoints(edge: CellState, points: Point[], source: CellState | null, target: CellState | null): void;
    /**
     * Transforms the given control point to an absolute point.
     */
    transformControlPoint(state: CellState, pt: Point, ignoreScale?: boolean): Point | null;
    /**
     * Returns true if the given edge should be routed with {@link graph.defaultLoopStyle}
     * or the {@link CellStateStyle.STYLE_LOOP} defined for the given edge.
     * This implementation returns `true` if the given edge is a loop and does not
     */
    isLoopStyleEnabled(edge: CellState, points?: Point[], source?: CellState | null, target?: CellState | null): boolean;
    /**
     * Returns the edge style function to be used to render the given edge state.
     */
    getEdgeStyle(edge: CellState, points?: Point[], source?: CellState | null, target?: CellState | null): EdgeStyleFunction | null;
    /**
     * Updates the terminal points in the given state after the edge style was
     * computed for the edge.
     *
     * @param state {@link CellState} whose terminal points should be updated.
     * @param source {@link CellState} that represents the source terminal.
     * @param target {@link CellState} that represents the target terminal.
     */
    updateFloatingTerminalPoints(state: CellState, source: CellState | null, target: CellState | null): void;
    /**
     * Updates the absolute terminal point in the given state for the given
     * start and end state, where start is the source if source is true.
     *
     * @param edge {@link CellState} whose terminal point should be updated.
     * @param start {@link CellState} for the terminal on "this" side of the edge.
     * @param end {@link CellState} for the terminal on the other side of the edge.
     * @param source Boolean indicating if start is the source terminal state.
     */
    updateFloatingTerminalPoint(edge: CellState, start: CellState, end: CellState | null, source: boolean): void;
    /**
     * Returns the floating terminal point for the given edge, start and end
     * state, where start is the source if source is true.
     *
     * @param edge {@link CellState} whose terminal point should be returned.
     * @param start {@link CellState} for the terminal on "this" side of the edge.
     * @param end {@link CellState} for the terminal on the other side of the edge.
     * @param source Boolean indicating if start is the source terminal state.
     */
    getFloatingTerminalPoint(edge: CellState, start: CellState, end: CellState | null, source: boolean): Point | null;
    /**
     * Returns an {@link CellState} that represents the source or target terminal or
     * port for the given edge.
     *
     * @param state {@link CellState} that represents the state of the edge.
     * @param terminal {@link CellState} that represents the terminal.
     * @param source Boolean indicating if the given terminal is the source terminal.
     */
    getTerminalPort(state: CellState, terminal: CellState, source?: boolean): CellState;
    /**
     * Returns an {@link Point} that defines the location of the intersection point between
     * the perimeter and the line between the center of the shape and the given point.
     *
     * @param terminal {@link CellState} for the source or target terminal.
     * @param next {@link Point} that lies outside the given terminal.
     * @param orthogonal Boolean that specifies if the orthogonal projection onto
     * the perimeter should be returned. If this is false then the intersection
     * of the perimeter and the line between the next and the center point is
     * returned.
     * @param border Optional border between the perimeter and the shape.
     */
    getPerimeterPoint(terminal: CellState, next: Point, orthogonal: boolean, border?: number): Point | null;
    /**
     * Returns the x-coordinate of the center point for automatic routing.
     */
    getRoutingCenterX(state: CellState): number;
    /**
     * Returns the y-coordinate of the center point for automatic routing.
     */
    getRoutingCenterY(state: CellState): number;
    /**
     * Returns the perimeter bounds for the given terminal, edge pair as an
     * {@link Rectangle}.
     *
     * If you have a model where each terminal has a relative child that should
     * act as the graphical endpoint for a connection from/to the terminal, then
     * this method can be replaced as follows:
     *
     * @example
     * ```javascript
     * var oldGetPerimeterBounds = getPerimeterBounds;
     * getPerimeterBounds(terminal, edge, isSource)
     * {
     *   var model = this.graph.getDataModel();
     *   var childCount = model.getChildCount(terminal.cell);
     *
     *   if (childCount > 0)
     *   {
     *     var child = model.getChildAt(terminal.cell, 0);
     *     var geo = model.getGeometry(child);
     *
     *     if (geo != null &&
     *         geo.relative)
     *     {
     *       var state = this.getState(child);
     *
     *       if (state != null)
     *       {
     *         terminal = state;
     *       }
     *     }
     *   }
     *
     *   return oldGetPerimeterBounds.apply(this, arguments);
     * };
     * ```
     *
     * @param terminal CellState that represents the terminal.
     * @param border Number that adds a border between the shape and the perimeter.
     */
    getPerimeterBounds(terminal: CellState, border?: number): Rectangle;
    /**
     * Returns the perimeter function for the given state.
     */
    getPerimeterFunction(state: CellState): import("../types").PerimeterFunction | null;
    /**
     * Returns the nearest point in the list of absolute points or the center
     * of the opposite terminal.
     *
     * @param edge {@link CellState} that represents the edge.
     * @param opposite {@link CellState} that represents the opposite terminal.
     * @param source Boolean indicating if the next point for the source or target
     * should be returned.
     */
    getNextPoint(edge: CellState, opposite: CellState | null, source?: boolean): Point;
    /**
     * Returns the nearest ancestor terminal that is visible. The edge appears
     * to be connected to this terminal on the display. The result of this method
     * is cached in {@link CellState.getVisibleTerminalState}.
     *
     * @param edge {@link mxCell} whose visible terminal should be returned.
     * @param source Boolean that specifies if the source or target terminal
     * should be returned.
     */
    getVisibleTerminal(edge: Cell, source: boolean): Cell | null;
    /**
     * Updates the given state using the bounding box of t
     * he absolute points.
     * Also updates {@link CellState.terminalDistance}, {@link CellState.length} and
     * {@link CellState.segments}.
     *
     * @param state {@link CellState} whose bounds should be updated.
     */
    updateEdgeBounds(state: CellState): void;
    /**
     * Returns the absolute point on the edge for the given relative
     * {@link Geometry} as an {@link Point}. The edge is represented by the given
     * {@link CellState}.
     *
     * @param state {@link CellState} that represents the state of the parent edge.
     * @param geometry {@link mxGeometry} that represents the relative location.
     */
    getPoint(state: CellState, geometry?: Geometry | null): Point;
    /**
     * Gets the relative point that describes the given, absolute label
     * position for the given edge state.
     *
     * @param state {@link CellState} that represents the state of the parent edge.
     * @param x Specifies the x-coordinate of the absolute label location.
     * @param y Specifies the y-coordinate of the absolute label location.
     */
    getRelativePoint(edgeState: CellState, x: number, y: number): Point;
    /**
     * Updates {@link CellState.absoluteOffset} for the given state. The absolute
     * offset is normally used for the position of the edge label. Is is
     * calculated from the geometry as an absolute offset from the center
     * between the two endpoints if the geometry is absolute, or as the
     * relative distance between the center along the line and the absolute
     * orthogonal distance if the geometry is relative.
     *
     * @param state {@link CellState} whose absolute offset should be updated.
     */
    updateEdgeLabelOffset(state: CellState): void;
    /**
     * Returns the {@link CellState} for the given cell. If create is true, then
     * the state is created if it does not yet exist.
     *
     * @param cell {@link mxCell} for which the {@link CellState} should be returned.
     * @param create Optional boolean indicating if a new state should be created
     * if it does not yet exist. Default is false.
     */
    getState(cell: Cell, create?: boolean): CellState | null;
    /**
     * Returns the {@link mxCellStates} for the given array of {@link Cell}. The array
     * contains all states that are not null, that is, the returned array may
     * have less elements than the given array. If no argument is given, then
     * this returns {@link states}.
     */
    getCellStates(cells?: Cell[] | null): CellState[];
    /**
     * Removes and returns the {@link CellState} for the given cell.
     *
     * @param cell {@link mxCell} for which the {@link CellState} should be removed.
     */
    removeState(cell: Cell): CellState | null;
    /**
     * Creates and returns an {@link CellState} for the given cell and initializes
     * it using {@link cellRenderer.initialize}.
     *
     * @param cell {@link mxCell} for which a new {@link CellState} should be created.
     */
    createState(cell: Cell): CellState;
    /**
     * Returns true if the event origin is one of the drawing panes or
     * containers of the view.
     */
    isContainerEvent(evt: MouseEvent): any;
    /**
     * Returns true if the event origin is one of the scrollbars of the
     * container in IE. Such events are ignored.
     */
    isScrollEvent(evt: MouseEvent): boolean;
    /**
     * Initializes the graph event dispatch loop for the specified container
     * and invokes {@link create} to create the required DOM nodes for the display.
     */
    init(): void;
    /**
     * Installs the required listeners in the container.
     */
    installListeners(): void;
    /**
     * Creates and returns the DOM nodes for the SVG display.
     */
    createSvg(): void;
    /**
     * Function: createHtml
     *
     * Creates the DOM nodes for the HTML display.
     */
    createHtml(): void;
    /**
     * Function: updateHtmlCanvasSize
     *
     * Updates the size of the HTML canvas.
     */
    updateHtmlCanvasSize(width: number, height: number): void;
    /**
     * Function: createHtmlPane
     *
     * Creates and returns a drawing pane in HTML (DIV).
     */
    createHtmlPane(width: string, height: string): HTMLElement;
    /**
     * Updates the style of the container after installing the SVG DOM elements.
     */
    updateContainerStyle(container: HTMLElement): void;
    /**
     * Destroys the view and all its resources.
     */
    destroy(): void;
    endHandler: MouseEventListener | null;
    moveHandler: MouseEventListener | null;
}
export default GraphView;
