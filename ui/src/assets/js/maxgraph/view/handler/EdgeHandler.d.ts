import CellMarker from '../cell/CellMarker';
import Point from '../geometry/Point';
import RectangleShape from '../geometry/node/RectangleShape';
import ConstraintHandler from './ConstraintHandler';
import Rectangle from '../geometry/Rectangle';
import { Graph } from '../Graph';
import CellState from '../cell/CellState';
import Shape from '../geometry/Shape';
import { CellHandle, ColorValue, Listenable } from '../../types';
import InternalMouseEvent from '../event/InternalMouseEvent';
import Cell from '../cell/Cell';
import ImageBox from '../image/ImageBox';
import EventSource from '../event/EventSource';
/**
 * Graph event handler that reconnects edges and modifies control points and the edge
 * label location.
 * Uses {@link CellMarker} for finding and highlighting new source and target vertices.
 * This handler is automatically created in mxGraph.createHandler for each selected edge.
 * **To enable adding/removing control points, the following code can be used**
 * @example
 * ```
 * mxEdgeHandler.prototype.addEnabled = true;
 * mxEdgeHandler.prototype.removeEnabled = true;
 * ```
 * Note: This experimental feature is not recommended for production use.
 * @class EdgeHandler
 */
declare class EdgeHandler {
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Reference to the <CellState> being modified.
     */
    state: CellState;
    /**
     * Holds the {@link CellMarker} which is used for highlighting terminals.
     */
    marker: CellMarker;
    /**
     * Holds the {@link ConstraintHandler} used for drawing and highlighting
     * constraints.
     */
    constraintHandler: ConstraintHandler;
    /**
     * Holds the current validation error while a connection is being changed.
     */
    error: string | null;
    /**
     * Holds the {@link Shape} that represents the preview edge.
     */
    shape: Shape;
    /**
     * Holds the {@link Shapes} that represent the points.
     */
    bends: Shape[];
    virtualBends: Shape[] | undefined;
    /**
     * Holds the {@link Shape} that represents the label position.
     */
    labelShape: Shape;
    /**
     * Specifies if cloning by control-drag is enabled. Default is true.
     */
    cloneEnabled: boolean;
    /**
     * Specifies if adding bends by shift-click is enabled. Default is false.
     * Note: This experimental feature is not recommended for production use.
     */
    addEnabled: boolean;
    /**
     * Specifies if removing bends by shift-click is enabled. Default is false.
     * Note: This experimental feature is not recommended for production use.
     */
    removeEnabled: boolean;
    /**
     * Specifies if removing bends by double click is enabled. Default is false.
     */
    dblClickRemoveEnabled: boolean;
    /**
     * Specifies if removing bends by dropping them on other bends is enabled.
     * Default is false.
     */
    mergeRemoveEnabled: boolean;
    /**
     * Specifies if removing bends by creating straight segments should be enabled.
     * If enabled, this can be overridden by holding down the alt key while moving.
     * Default is false.
     */
    straightRemoveEnabled: boolean;
    /**
     * Specifies if virtual bends should be added in the center of each
     * segments. These bends can then be used to add new waypoints.
     * Default is false.
     */
    virtualBendsEnabled: boolean;
    /**
     * Opacity to be used for virtual bends (see <virtualBendsEnabled>).
     * Default is 20.
     */
    virtualBendOpacity: number;
    /**
     * Specifies if the parent should be highlighted if a child cell is selected.
     * Default is false.
     */
    parentHighlightEnabled: boolean;
    /**
     * Specifies if bends should be added to the graph container. This is updated
     * in <init> based on whether the edge or one of its terminals has an HTML
     * label in the container.
     */
    preferHtml: boolean;
    /**
     * Specifies if the bounds of handles should be used for hit-detection in IE
     * Default is true.
     */
    allowHandleBoundsCheck: boolean;
    /**
     * Specifies if waypoints should snap to the routing centers of terminals.
     * Default is false.
     */
    snapToTerminals: boolean;
    /**
     * Optional {@link Image} to be used as handles. Default is null.
     */
    handleImage: ImageBox | null;
    labelHandleImage: ImageBox | null;
    /**
     * Optional tolerance for hit-detection in <getHandleForEvent>. Default is 0.
     */
    tolerance: number;
    /**
     * Specifies if connections to the outline of a highlighted target should be
     * enabled. This will allow to place the connection point along the outline of
     * the highlighted target. Default is false.
     */
    outlineConnect: boolean;
    /**
     * Specifies if the label handle should be moved if it intersects with another
     * handle. Uses <checkLabelHandle> for checking and moving. Default is false.
     */
    manageLabelHandle: boolean;
    escapeHandler: (sender: Listenable, evt: Event) => void;
    currentPoint: Point | null;
    parentHighlight: RectangleShape | null;
    index: number | null;
    isSource: boolean;
    isTarget: boolean;
    label: Point;
    isLabel: boolean;
    points: Point[];
    snapPoint: Point | null;
    abspoints: (Point | null)[];
    customHandles: CellHandle[] | undefined;
    startX: number;
    startY: number;
    outline: boolean;
    active: boolean;
    constructor(state: CellState);
    /**
     * Returns true if the parent highlight should be visible. This implementation
     * always returns true.
     */
    isParentHighlightVisible(): boolean | null;
    /**
     * Updates the highlight of the parent if <parentHighlightEnabled> is true.
     */
    updateParentHighlight(): void;
    /**
     * Returns an array of custom handles. This implementation returns an empty array.
     */
    createCustomHandles(): CellHandle[];
    /**
     * Returns true if virtual bends should be added. This returns true if
     * <virtualBendsEnabled> is true and the current style allows and
     * renders custom waypoints.
     */
    isVirtualBendsEnabled(evt?: Event): boolean | undefined;
    /**
     * Returns true if the given cell allows new connections to be created. This implementation
     * always returns true.
     */
    isCellEnabled(cell: Cell): boolean;
    /**
     * Returns true if the given event is a trigger to add a new Point. This
     * implementation returns true if shift is pressed.
     */
    isAddPointEvent(evt: MouseEvent): boolean;
    /**
     * Returns true if the given event is a trigger to remove a point. This
     * implementation returns true if shift is pressed.
     */
    isRemovePointEvent(evt: MouseEvent): boolean;
    /**
     * Returns the list of points that defines the selection stroke.
     */
    getSelectionPoints(state: CellState): (Point | null)[];
    /**
     * Creates the shape used to draw the selection border.
     */
    createParentHighlightShape(bounds: Rectangle): RectangleShape;
    /**
     * Creates the shape used to draw the selection border.
     */
    createSelectionShape(points: (Point | null)[]): Shape;
    /**
     * Returns {@link EDGE_SELECTION_COLOR}.
     */
    getSelectionColor(): string;
    /**
     * Returns {@link EDGE_SELECTION_STROKEWIDTH}.
     */
    getSelectionStrokeWidth(): number;
    /**
     * Returns {@link EDGE_SELECTION_DASHED}.
     */
    isSelectionDashed(): boolean;
    /**
     * Returns true if the given cell is connectable. This is a hook to
     * disable floating connections. This implementation returns true.
     */
    isConnectableCell(cell: Cell): boolean;
    /**
     * Creates and returns the {@link CellMarker} used in {@link marker}.
     */
    getCellAt(x: number, y: number): Cell | null;
    /**
     * Creates and returns the {@link CellMarker} used in {@link marker}.
     */
    createMarker(): EdgeHandlerCellMarker;
    /**
     * Returns the error message or an empty string if the connection for the
     * given source, target pair is not valid. Otherwise it returns null. This
     * implementation uses {@link Graph#getEdgeValidationError}.
     *
     * @param source <Cell> that represents the source terminal.
     * @param target <Cell> that represents the target terminal.
     */
    validateConnection(source: Cell | null, target: Cell | null): string | null;
    /**
     * Creates and returns the bends used for modifying the edge. This is
     * typically an array of {@link RectangleShape}.
     */
    createBends(): RectangleShape[];
    /**
     * Creates and returns the bends used for modifying the edge. This is
     * typically an array of {@link RectangleShape}.
     */
    createVirtualBends(): RectangleShape[];
    /**
     * Creates the shape used to display the given bend.
     */
    isHandleEnabled(index: number): boolean;
    /**
     * Returns true if the handle at the given index is visible.
     */
    isHandleVisible(index: number): boolean;
    /**
     * Creates the shape used to display the given bend. Note that the index may be
     * null for special cases, such as when called from
     * {@link ElbowEdgeHandler#createVirtualBend}. Only images and rectangles should be
     * returned if support for HTML labels with not foreign objects is required.
     * Index if null for virtual handles.
     */
    createHandleShape(index?: number): RectangleShape;
    /**
     * Creates the shape used to display the the label handle.
     */
    createLabelHandleShape(): RectangleShape;
    /**
     * Helper method to initialize the given bend.
     *
     * @param bend {@link Shape} that represents the bend to be initialized.
     */
    initBend(bend: Shape, dblClick?: (evt: MouseEvent) => void): void;
    /**
     * Returns the index of the handle for the given event.
     */
    getHandleForEvent(me: InternalMouseEvent): number | null;
    /**
     * Returns true if the given event allows virtual bends to be added. This
     * implementation returns true.
     */
    isAddVirtualBendEvent(me: InternalMouseEvent): boolean;
    /**
     * Returns true if the given event allows custom handles to be changed. This
     * implementation returns true.
     */
    isCustomHandleEvent(me: InternalMouseEvent): boolean;
    /**
     * Handles the event by checking if a special element of the handler
     * was clicked, in which case the index parameter is non-null. The
     * indices may be one of <LABEL_HANDLE> or the number of the respective
     * control point. The source and target points are used for reconnecting
     * the edge.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Starts the handling of the mouse gesture.
     */
    start(x: number, y: number, index: number): void;
    /**
     * Returns a clone of the current preview state for the given point and terminal.
     */
    clonePreviewState(point: Point, terminal: Cell | null): CellState;
    /**
     * Returns the tolerance for the guides. Default value is
     * gridSize * scale / 2.
     */
    getSnapToTerminalTolerance(): number;
    /**
     * Hook for subclassers do show details while the handler is active.
     */
    updateHint(me: InternalMouseEvent, point: Point): void;
    /**
     * Hooks for subclassers to hide details when the handler gets inactive.
     */
    removeHint(): void;
    /**
     * Hook for rounding the unscaled width or height. This uses Math.round.
     */
    roundLength(length: number): number;
    /**
     * Returns true if <snapToTerminals> is true and if alt is not pressed.
     */
    isSnapToTerminalsEvent(me: InternalMouseEvent): boolean;
    /**
     * Returns the point for the given event.
     */
    getPointForEvent(me: InternalMouseEvent): Point;
    /**
     * Updates the given preview state taking into account the state of the constraint handler.
     */
    getPreviewTerminalState(me: InternalMouseEvent): CellState | null;
    /**
     * Updates the given preview state taking into account the state of the constraint handler.
     *
     * @param pt {@link Point} that contains the current pointer position.
     * @param me Optional {@link MouseEvent} that contains the current event.
     */
    getPreviewPoints(pt: Point, me?: InternalMouseEvent): Point[] | null;
    /**
     * Returns true if <outlineConnect> is true and the source of the event is the outline shape
     * or shift is pressed.
     */
    isOutlineConnectEvent(me: InternalMouseEvent): boolean;
    /**
     * Updates the given preview state taking into account the state of the constraint handler.
     */
    updatePreviewState(edgeState: CellState, point: Point, terminalState: CellState | null, me: InternalMouseEvent, outline?: boolean): void;
    /**
     * Handles the event by updating the preview.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event to applying the previewed changes on the edge by
     * using {@link moveLabel}, <connect> or <changePoints>.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Resets the state of this handler.
     */
    reset(): void;
    /**
     * Sets the color of the preview to the given value.
     */
    setPreviewColor(color: ColorValue): void;
    /**
     * Converts the given point in-place from screen to unscaled, untranslated
     * graph coordinates and applies the grid. Returns the given, modified
     * point instance.
     *
     * @param point {@link Point} to be converted.
     * @param gridEnabled Boolean that specifies if the grid should be applied.
     */
    convertPoint(point: Point, gridEnabled: boolean): Point;
    /**
     * Changes the coordinates for the label of the given edge.
     *
     * @param edge <Cell> that represents the edge.
     * @param x Integer that specifies the x-coordinate of the new location.
     * @param y Integer that specifies the y-coordinate of the new location.
     */
    moveLabel(edgeState: CellState, x: number, y: number): void;
    /**
     * Changes the terminal or terminal point of the given edge in the graph
     * model.
     *
     * @param edge <Cell> that represents the edge to be reconnected.
     * @param terminal <Cell> that represents the new terminal.
     * @param isSource Boolean indicating if the new terminal is the source or
     * target terminal.
     * @param isClone Boolean indicating if the new connection should be a clone of
     * the old edge.
     * @param me {@link MouseEvent} that contains the mouse up event.
     */
    connect(edge: Cell, terminal: Cell, isSource: boolean, isClone: boolean, me: InternalMouseEvent): Cell;
    /**
     * Changes the terminal point of the given edge.
     */
    changeTerminalPoint(edge: Cell, point: Point, isSource: boolean, clone: boolean): Cell;
    /**
     * Changes the control points of the given edge in the graph model.
     */
    changePoints(edge: Cell, points: Point[], clone: boolean): Cell;
    /**
     * Adds a control point for the given state and event.
     */
    addPoint(state: CellState, evt: MouseEvent): void;
    /**
     * Adds a control point at the given point.
     */
    addPointAt(state: CellState, x: number, y: number): void;
    /**
     * Removes the control point at the given index from the given state.
     */
    removePoint(state: CellState, index: number): void;
    /**
     * Returns the fillcolor for the handle at the given index.
     */
    getHandleFillColor(index: number): string;
    /**
     * Redraws the preview, and the bends- and label control points.
     */
    redraw(ignoreHandles?: boolean): void;
    /**
     * Redraws the handles.
     */
    redrawHandles(): void;
    /**
     * Returns true if the given custom handle is visible.
     */
    isCustomHandleVisible(handle: CellHandle): boolean;
    /**
     * Shortcut to <hideSizers>.
     */
    setHandlesVisible(visible: boolean): void;
    /**
     * Updates and redraws the inner bends.
     *
     * @param p0 {@link Point} that represents the location of the first point.
     * @param pe {@link Point} that represents the location of the last point.
     */
    redrawInnerBends(p0: Point, pe: Point): void;
    /**
     * Checks if the label handle intersects the given bounds and moves it if it
     * intersects.
     */
    checkLabelHandle(b: Rectangle): void;
    /**
     * Redraws the preview.
     */
    drawPreview(): void;
    /**
     * Refreshes the bends of this handler.
     */
    refresh(): void;
    /**
     * Returns true if <destroy> was called.
     */
    isDestroyed(): boolean;
    /**
     * Destroys all elements in <bends>.
     */
    destroyBends(bends: Shape[] | CellHandle[]): void;
    /**
     * Destroys the handler and all its resources and DOM nodes. This does
     * normally not need to be called as handlers are destroyed automatically
     * when the corresponding cell is deselected.
     */
    onDestroy(): void;
}
declare class EdgeHandlerCellMarker extends CellMarker {
    edgeHandler: EdgeHandler;
    constructor(graph: Graph, edgeHandler: EdgeHandler, validColor?: ColorValue, invalidColor?: ColorValue, hotspot?: number);
    getCell: (me: InternalMouseEvent) => Cell | null;
    isValidState: (state: CellState) => boolean;
}
export default EdgeHandler;
