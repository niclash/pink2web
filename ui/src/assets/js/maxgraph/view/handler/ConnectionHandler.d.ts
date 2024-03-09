import Cell from '../cell/Cell';
import Point from '../geometry/Point';
import InternalMouseEvent from '../event/InternalMouseEvent';
import ImageShape from '../geometry/node/ImageShape';
import CellMarker from '../cell/CellMarker';
import ConstraintHandler from './ConstraintHandler';
import EventSource from '../event/EventSource';
import Image from '../image/ImageBox';
import CellState from '../cell/CellState';
import { Graph } from '../Graph';
import ConnectionConstraint from '../other/ConnectionConstraint';
import Shape from '../geometry/Shape';
import { CellStyle, ColorValue, GraphPlugin, Listenable } from '../../types';
type FactoryMethod = (source: Cell | null, target: Cell | null, style?: CellStyle) => Cell;
/**
 * Graph event handler that creates new connections. Uses {@link TerminalMarker}
 * for finding and highlighting the source and target vertices and
 * <factoryMethod> to create the edge instance. This handler is built-into
 * {@link Graph#connectionHandler} and enabled using {@link Graph#setConnectable}.
 *
 * Example:
 *
 * ```javascript
 * new mxConnectionHandler(graph, (source, target, style)=>
 * {
 *   edge = new mxCell('', new mxGeometry());
 *   edge.setEdge(true);
 *   edge.setStyle(style);
 *   edge.geometry.relative = true;
 *   return edge;
 * });
 * ```
 *
 * Here is an alternative solution that just sets a specific user object for
 * new edges by overriding <insertEdge>.
 *
 * ```javascript
 * mxConnectionHandlerInsertEdge = insertEdge;
 * insertEdge = (parent, id, value, source, target, style)=>
 * {
 *   value = 'Test';
 *
 *   return mxConnectionHandlerInsertEdge.apply(this, arguments);
 * };
 * ```
 *
 * Using images to trigger connections:
 *
 * This handler uses mxTerminalMarker to find the source and target cell for
 * the new connection and creates a new edge using <connect>. The new edge is
 * created using <createEdge> which in turn uses <factoryMethod> or creates a
 * new default edge.
 *
 * The handler uses a "highlight-paradigm" for indicating if a cell is being
 * used as a source or target terminal, as seen in other diagramming products.
 * In order to allow both, moving and connecting cells at the same time,
 * {@link Constants#DEFAULT_HOTSPOT} is used in the handler to determine the hotspot
 * of a cell, that is, the region of the cell which is used to trigger a new
 * connection. The constant is a value between 0 and 1 that specifies the
 * amount of the width and height around the center to be used for the hotspot
 * of a cell and its default value is 0.5. In addition,
 * {@link Constants#MIN_HOTSPOT_SIZE} defines the minimum number of pixels for the
 * width and height of the hotspot.
 *
 * This solution, while standards compliant, may be somewhat confusing because
 * there is no visual indicator for the hotspot and the highlight is seen to
 * switch on and off while the mouse is being moved in and out. Furthermore,
 * this paradigm does not allow to create different connections depending on
 * the highlighted hotspot as there is only one hotspot per cell and it
 * normally does not allow cells to be moved and connected at the same time as
 * there is no clear indication of the connectable area of the cell.
 *
 * To come across these issues, the handle has an additional <createIcons> hook
 * with a default implementation that allows to create one icon to be used to
 * trigger new connections. If this icon is specified, then new connections can
 * only be created if the image is clicked while the cell is being highlighted.
 * The <createIcons> hook may be overridden to create more than one
 * {@link ImageShape} for creating new connections, but the default implementation
 * supports one image and is used as follows:
 *
 * In order to display the "connect image" whenever the mouse is over the cell,
 * an DEFAULT_HOTSPOT of 1 should be used:
 *
 * ```javascript
 * mxConstants.DEFAULT_HOTSPOT = 1;
 * ```
 *
 * In order to avoid confusion with the highlighting, the highlight color
 * should not be used with a connect image:
 *
 * ```javascript
 * mxConstants.HIGHLIGHT_COLOR = null;
 * ```
 *
 * To install the image, the connectImage field of the mxConnectionHandler must
 * be assigned a new {@link Image} instance:
 *
 * ```javascript
 * connectImage = new mxImage('images/green-dot.gif', 14, 14);
 * ```
 *
 * This will use the green-dot.gif with a width and height of 14 pixels as the
 * image to trigger new connections. In createIcons the icon field of the
 * handler will be set in order to remember the icon that has been clicked for
 * creating the new connection. This field will be available under selectedIcon
 * in the connect method, which may be overridden to take the icon that
 * triggered the new connection into account. This is useful if more than one
 * icon may be used to create a connection.
 *
 * Group: Events
 *
 * Event: mxEvent.START
 *
 * Fires when a new connection is being created by the user. The <code>state</code>
 * property contains the state of the source cell.
 *
 * Event: mxEvent.CONNECT
 *
 * Fires between begin- and endUpdate in <connect>. The <code>cell</code>
 * property contains the inserted edge, the <code>event</code> and <code>target</code>
 * properties contain the respective arguments that were passed to <connect> (where
 * target corresponds to the dropTarget argument). Finally, the <code>terminal</code>
 * property corresponds to the target argument in <connect> or the clone of the source
 * terminal if <createTarget> is enabled.
 *
 * Note that the target is the cell under the mouse where the mouse button was released.
 * Depending on the logic in the handler, this doesn't necessarily have to be the target
 * of the inserted edge. To print the source, target or any optional ports IDs that the
 * edge is connected to, the following code can be used. To get more details about the
 * actual connection point, {@link Graph#getConnectionConstraint} can be used. To resolve
 * the port IDs, use <Transactions.getCell>.
 *
 * ```javascript
 * graph.getPlugin('ConnectionHandler')?.addListener(mxEvent.CONNECT, (sender, evt) =>
 * {
 *   let edge = evt.getProperty('cell');
 *   let source = graph.getDataModel().getTerminal(edge, true);
 *   let target = graph.getDataModel().getTerminal(edge, false);
 *
 *   let style = graph.getCellStyle(edge);
 *   let sourcePortId = style[mxConstants.STYLE_SOURCE_PORT];
 *   let targetPortId = style[mxConstants.STYLE_TARGET_PORT];
 *
 *   MaxLog.show();
 *   MaxLog.debug('connect', edge, source.id, target.id, sourcePortId, targetPortId);
 * });
 * ```
 *
 * Event: mxEvent.RESET
 *
 * Fires when the <reset> method is invoked.
 *
 * Constructor: mxConnectionHandler
 *
 * Constructs an event handler that connects vertices using the specified
 * factory method to create the new edges. Modify
 * {@link Constants#ACTIVE_REGION} to setup the region on a cell which triggers
 * the creation of a new connection or use connect icons as explained
 * above.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 * @param factoryMethod Optional function to create the edge. The function takes
 * the source and target <Cell> as the first and second argument and an
 * optional cell style from the preview as the third argument. It returns
 * the <Cell> that represents the new edge.
 */
declare class ConnectionHandler extends EventSource implements GraphPlugin {
    static pluginId: string;
    previous: CellState | null;
    iconState: CellState | null;
    icons: ImageShape[];
    cell: Cell | null;
    currentPoint: Point | null;
    sourceConstraint: ConnectionConstraint | null;
    shape: Shape | null;
    icon: ImageShape | null;
    originalPoint: Point | null;
    currentState: CellState | null;
    selectedIcon: ImageShape | null;
    waypoints: Point[];
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Function that is used for creating new edges. The function takes the
     * source and target <Cell> as the first and second argument and returns
     * a new <Cell> that represents the edge. This is used in <createEdge>.
     */
    factoryMethod: FactoryMethod | null;
    /**
     * Specifies if icons should be displayed inside the graph container instead
     * of the overlay pane. This is used for HTML labels on vertices which hide
     * the connect icon. This has precedence over {@link moveIconBack} when set
     * to true.
     * @default `false`
     */
    moveIconFront: boolean;
    /**
     * Specifies if icons should be moved to the back of the overlay pane. This can
     * be set to true if the icons of the connection handler conflict with other
     * handles, such as the vertex label move handle. Default is false.
     */
    moveIconBack: boolean;
    /**
     * {@link Image} that is used to trigger the creation of a new connection.
     * This is used in {@link createIcons}.
     * @default null
     */
    connectImage: Image | null;
    /**
     * Specifies if the connect icon should be centered on the target state
     * while connections are being previewed. Default is false.
     */
    targetConnectImage: boolean;
    /**
     * Specifies if events are handled. Default is false.
     */
    enabled: boolean;
    /**
     * Specifies if new edges should be selected. Default is true.
     */
    select: boolean;
    /**
     * Specifies if <createTargetVertex> should be called if no target was under the
     * mouse for the new connection. Setting this to true means the connection
     * will be drawn as valid if no target is under the mouse, and
     * <createTargetVertex> will be called before the connection is created between
     * the source cell and the newly created vertex in <createTargetVertex>, which
     * can be overridden to create a new target. Default is false.
     */
    createTarget: boolean;
    /**
     * Holds the {@link TerminalMarker} used for finding source and target cells.
     */
    marker: CellMarker;
    /**
     * Holds the {@link ConstraintHandler} used for drawing and highlighting
     * constraints.
     */
    constraintHandler: ConstraintHandler;
    /**
     * Holds the current validation error while connections are being created.
     */
    error: string | null;
    /**
     * Specifies if single clicks should add waypoints on the new edge. Default is
     * false.
     */
    waypointsEnabled: boolean;
    /**
     * Specifies if the connection handler should ignore the state of the mouse
     * button when highlighting the source. Default is false, that is, the
     * handler only highlights the source if no button is being pressed.
     */
    ignoreMouseDown: boolean;
    /**
     * Holds the {@link Point} where the mouseDown took place while the handler is
     * active.
     */
    first: Point | null;
    /**
     * Holds the offset for connect icons during connection preview.
     * Default is mxPoint(0, {@link Constants#TOOLTIP_VERTICAL_OFFSET}).
     * Note that placing the icon under the mouse pointer with an
     * offset of (0,0) will affect hit detection.
     */
    connectIconOffset: Point;
    /**
     * Optional <CellState> that represents the preview edge while the
     * handler is active. This is created in <createEdgeState>.
     */
    edgeState: CellState | null;
    /**
     * Holds the change event listener for later removal.
     */
    changeHandler: (sender: Listenable) => void;
    /**
     * Holds the drill event listener for later removal.
     */
    drillHandler: (sender: Listenable) => void;
    /**
     * Counts the number of mouseDown events since the start. The initial mouse
     * down event counts as 1.
     */
    mouseDownCounter: number;
    /**
     * Switch to enable moving the preview away from the mousepointer. This is required in browsers
     * where the preview cannot be made transparent to events and if the built-in hit detection on
     * the HTML elements in the page should be used. Default is the value of <Client.IS_VML>.
     */
    movePreviewAway: boolean;
    /**
     * Specifies if connections to the outline of a highlighted target should be
     * enabled. This will allow to place the connection point along the outline of
     * the highlighted target. Default is false.
     */
    outlineConnect: boolean;
    /**
     * Specifies if the actual shape of the edge state should be used for the preview.
     * Default is false. (Ignored if no edge state is created in <createEdgeState>.)
     */
    livePreview: boolean;
    /**
     * Specifies the cursor to be used while the handler is active. Default is null.
     */
    cursor: string | null;
    /**
     * Specifies if new edges should be inserted before the source vertex in the
     * cell hierarchy. Default is false for backwards compatibility.
     */
    insertBeforeSource: boolean;
    escapeHandler: () => void;
    constructor(graph: Graph, factoryMethod?: FactoryMethod | null);
    /**
     * Returns true if events are handled. This implementation
     * returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation
     * updates <enabled>.
     *
     * @param enabled Boolean that specifies the new enabled state.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns <insertBeforeSource> for non-loops and false for loops.
     *
     * @param edge <Cell> that represents the edge to be inserted.
     * @param source <Cell> that represents the source terminal.
     * @param target <Cell> that represents the target terminal.
     * @param evt Mousedown event of the connect gesture.
     * @param dropTarget <Cell> that represents the cell under the mouse when it was
     * released.
     */
    isInsertBefore(edge: Cell, source: Cell | null, target: Cell | null, evt: MouseEvent, dropTarget: Cell | null): boolean;
    /**
     * Returns <createTarget>.
     *
     * @param evt Current active native pointer event.
     */
    isCreateTarget(evt: Event): boolean;
    /**
     * Sets <createTarget>.
     */
    setCreateTarget(value: boolean): void;
    /**
     * Creates the preview shape for new connections.
     */
    createShape(): Shape;
    /**
     * Returns true if the given cell is connectable. This is a hook to
     * disable floating connections. This implementation returns true.
     */
    isConnectableCell(cell: Cell): boolean;
    /**
     * Creates and returns the {@link CellMarker} used in {@link arker}.
     */
    createMarker(): ConnectionHandlerCellMarker;
    /**
     * Starts a new connection for the given state and coordinates.
     */
    start(state: CellState, x: number, y: number, edgeState: CellState): void;
    /**
     * Returns true if the source terminal has been clicked and a new
     * connection is currently being previewed.
     */
    isConnecting(): boolean;
    /**
     * Returns {@link Graph#isValidSource} for the given source terminal.
     *
     * @param cell <Cell> that represents the source terminal.
     * @param me {@link MouseEvent} that is associated with this call.
     */
    isValidSource(cell: Cell, me: InternalMouseEvent): boolean;
    /**
     * Returns true. The call to {@link Graph#isValidTarget} is implicit by calling
     * {@link Graph#getEdgeValidationError} in <validateConnection>. This is an
     * additional hook for disabling certain targets in this specific handler.
     *
     * @param cell <Cell> that represents the target terminal.
     */
    isValidTarget(cell: Cell): boolean;
    /**
     * Returns the error message or an empty string if the connection for the
     * given source target pair is not valid. Otherwise it returns null. This
     * implementation uses {@link Graph#getEdgeValidationError}.
     *
     * @param source <Cell> that represents the source terminal.
     * @param target <Cell> that represents the target terminal.
     */
    validateConnection(source: Cell, target: Cell): string | null;
    /**
     * Hook to return the {@link Image} used for the connection icon of the given
     * <CellState>. This implementation returns <connectImage>.
     *
     * @param state <CellState> whose connect image should be returned.
     */
    getConnectImage(state: CellState): Image | null;
    /**
     * Returns true if the state has a HTML label in the graph's container, otherwise
     * it returns {@link oveIconFront}.
     *
     * @param state <CellState> whose connect icons should be returned.
     */
    isMoveIconToFrontForState(state: CellState): boolean;
    /**
     * Creates the array {@link ImageShapes} that represent the connect icons for
     * the given <CellState>.
     *
     * @param state <CellState> whose connect icons should be returned.
     */
    createIcons(state: CellState): ImageShape[];
    /**
     * Redraws the given array of {@link ImageShapes}.
     *
     * @param icons Array of {@link ImageShapes} to be redrawn.
     */
    redrawIcons(icons: ImageShape[], state: CellState): void;
    getIconPosition(icon: ImageShape, state: CellState): Point;
    /**
     * Destroys the connect icons and resets the respective state.
     */
    destroyIcons(): void;
    /**
     * Returns true if the given mouse down event should start this handler. The
     * This implementation returns true if the event does not force marquee
     * selection, and the currentConstraint and currentFocus of the
     * <constraintHandler> are not null, or <previous> and <error> are not null and
     * <icons> is null or <icons> and <icon> are not null.
     */
    isStartEvent(me: InternalMouseEvent): boolean;
    /**
     * Handles the event by initiating a new connection.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Returns true if a tap on the given source state should immediately start
     * connecting. This implementation returns true if the state is not movable
     * in the graph.
     */
    isImmediateConnectSource(state: CellState): boolean;
    /**
     * Hook to return an <CellState> which may be used during the preview.
     * This implementation returns null.
     *
     * Use the following code to create a preview for an existing edge style:
     *
     * ```javascript
     * graph.getPlugin('ConnectionHandler').createEdgeState(me)
     * {
     *   var edge = graph.createEdge(null, null, null, null, null, 'edgeStyle=elbowEdgeStyle');
     *
     *   return new CellState(this.graph.view, edge, this.graph.getCellStyle(edge));
     * };
     * ```
     */
    createEdgeState(me?: InternalMouseEvent): CellState | null;
    /**
     * Returns true if <outlineConnect> is true and the source of the event is the outline shape
     * or shift is pressed.
     */
    isOutlineConnectEvent(me: InternalMouseEvent): boolean;
    /**
     * Updates the current state for a given mouse move event by using
     * the {@link arker}.
     */
    updateCurrentState(me: InternalMouseEvent, point: Point): void;
    /**
     * Returns true if the given cell does not allow new connections to be created.
     */
    isCellEnabled(cell: Cell): boolean;
    /**
     * Converts the given point from screen coordinates to model coordinates.
     */
    convertWaypoint(point: Point): void;
    /**
     * Called to snap the given point to the current preview. This snaps to the
     * first point of the preview if alt is not pressed.
     */
    snapToPreview(me: InternalMouseEvent, point: Point): void;
    /**
     * Handles the event by updating the preview edge or by highlighting
     * a possible source or target terminal.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Updates <edgeState>.
     */
    updateEdgeState(current: Point | null, constraint: ConnectionConstraint | null): void;
    /**
     * Returns the perimeter point for the given target state.
     *
     * @param state <CellState> that represents the target cell state.
     * @param _me {@link MouseEvent} that represents the mouse move.
     */
    getTargetPerimeterPoint(state: CellState, _me: InternalMouseEvent): Point | null;
    /**
     * Hook to update the icon position(s) based on a mouseOver event. This is
     * an empty implementation.
     *
     * @param state <CellState> that represents the target cell state.
     * @param next {@link Point} that represents the next point along the previewed edge.
     * @param me {@link MouseEvent} that represents the mouse move.
     */
    getSourcePerimeterPoint(state: CellState, next: Point, me: InternalMouseEvent): Point | null;
    /**
     * Hook to update the icon position(s) based on a mouseOver event. This is
     * an empty implementation.
     *
     * @param state <CellState> under the mouse.
     * @param icons Array of currently displayed icons.
     * @param me {@link MouseEvent} that contains the mouse event.
     */
    updateIcons(state: CellState, icons: ImageShape[], me: InternalMouseEvent): void;
    /**
     * Returns true if the given mouse up event should stop this handler. The
     * connection will be created if <error> is null. Note that this is only
     * called if <waypointsEnabled> is true. This implemtation returns true
     * if there is a cell state in the given event.
     */
    isStopEvent(me: InternalMouseEvent): boolean;
    /**
     * Adds the waypoint for the given event to <waypoints>.
     */
    addWaypointForEvent(me: InternalMouseEvent): void;
    /**
     * Returns true if the connection for the given constraints is valid. This
     * implementation returns true if the constraints are not pointing to the
     * same fixed connection point.
     */
    checkConstraints(c1: ConnectionConstraint | null, c2: ConnectionConstraint | null): boolean;
    /**
     * Handles the event by inserting the new connection.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Resets the state of this handler.
     */
    reset(): void;
    /**
     * Redraws the preview edge using the color and width returned by
     * <getEdgeColor> and <getEdgeWidth>.
     */
    drawPreview(): void;
    /**
     * Returns the color used to draw the preview edge. This returns green if
     * there is no edge validation error and red otherwise.
     *
     * @param valid Boolean indicating if the color for a valid edge should be
     * returned.
     */
    updatePreview(valid: boolean): void;
    /**
     * Returns the color used to draw the preview edge. This returns green if
     * there is no edge validation error and red otherwise.
     *
     * @param valid Boolean indicating if the color for a valid edge should be
     * returned.
     */
    getEdgeColor(valid: boolean): "#00FF00" | "#FF0000";
    /**
     * Returns the width used to draw the preview edge. This returns 3 if
     * there is no edge validation error and 1 otherwise.
     *
     * @param valid Boolean indicating if the width for a valid edge should be
     * returned.
     */
    getEdgeWidth(valid: boolean): number;
    /**
     * Connects the given source and target using a new edge. This
     * implementation uses <createEdge> to create the edge.
     *
     * @param source <Cell> that represents the source terminal.
     * @param target <Cell> that represents the target terminal.
     * @param evt Mousedown event of the connect gesture.
     * @param dropTarget <Cell> that represents the cell under the mouse when it was
     * released.
     */
    connect(source: Cell | null, target: Cell | null, evt: MouseEvent, dropTarget?: Cell | null): void;
    /**
     * Selects the given edge after adding a new connection. The target argument
     * contains the target vertex if one has been inserted.
     */
    selectCells(edge: Cell | null, target: Cell | null): void;
    /**
     * Creates, inserts and returns the new edge for the given parameters. This
     * implementation does only use <createEdge> if <factoryMethod> is defined,
     * otherwise {@link Graph#insertEdge} will be used.
     */
    insertEdge(parent: Cell, id: string, value: any, source: Cell | null, target: Cell | null, style: CellStyle): Cell;
    /**
     * Hook method for creating new vertices on the fly if no target was
     * under the mouse. This is only called if <createTarget> is true and
     * returns null.
     *
     * @param evt Mousedown event of the connect gesture.
     * @param source <Cell> that represents the source terminal.
     */
    createTargetVertex(evt: MouseEvent, source: Cell): Cell;
    /**
     * Returns the tolerance for aligning new targets to sources. This returns the grid size / 2.
     */
    getAlignmentTolerance(evt?: MouseEvent): number;
    /**
     * Creates and returns a new edge using <factoryMethod> if one exists. If
     * no factory method is defined, then a new default edge is returned. The
     * source and target arguments are informal, the actual connection is
     * setup later by the caller of this function.
     *
     * @param value Value to be used for creating the edge.
     * @param source <Cell> that represents the source terminal.
     * @param target <Cell> that represents the target terminal.
     * @param style Optional style from the preview edge.
     */
    createEdge(value: any, source: Cell | null, target: Cell | null, style?: CellStyle): Cell;
    /**
     * Destroys the handler and all its resources and DOM nodes. This should be
     * called on all instances. It is called automatically for the built-in
     * instance created for each {@link Graph}.
     */
    onDestroy(): void;
}
declare class ConnectionHandlerCellMarker extends CellMarker {
    connectionHandler: ConnectionHandler;
    hotspotEnabled: boolean;
    constructor(graph: Graph, connectionHandler: ConnectionHandler, validColor?: ColorValue, invalidColor?: ColorValue, hotspot?: number);
    getCell(me: InternalMouseEvent): Cell | null;
    isValidState(state: CellState): boolean;
    getMarkerColor(evt: Event, state: CellState, isValid: boolean): string;
    intersects(state: CellState, evt: InternalMouseEvent): boolean;
}
export default ConnectionHandler;
