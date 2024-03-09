import Rectangle from '../geometry/Rectangle';
import RectangleShape from '../geometry/node/RectangleShape';
import EllipseShape from '../geometry/node/EllipseShape';
import Point from '../geometry/Point';
import { Graph } from '../Graph';
import CellState from '../cell/CellState';
import Image from '../image/ImageBox';
import Cell from '../cell/Cell';
import { CellHandle, Listenable } from '../../types';
import Shape from '../geometry/Shape';
import InternalMouseEvent from '../event/InternalMouseEvent';
import EdgeHandler from './EdgeHandler';
import EventSource from '../event/EventSource';
/**
 * Event handler for resizing cells. This handler is automatically created in
 * {@link Graph#createHandler}.
 *
 * Constructor: mxVertexHandler
 *
 * Constructs an event handler that allows to resize vertices
 * and groups.
 *
 * @param state <CellState> of the cell to be resized.
 */
declare class VertexHandler {
    escapeHandler: (sender: Listenable, evt: Event) => void;
    selectionBounds: Rectangle;
    bounds: Rectangle;
    selectionBorder: RectangleShape;
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Reference to the <CellState> being modified.
     */
    state: CellState;
    sizers: Shape[];
    /**
     * Specifies if only one sizer handle at the bottom, right corner should be
     * used. Default is false.
     */
    singleSizer: boolean;
    /**
     * Holds the index of the current handle.
     */
    index: number | null;
    /**
     * Specifies if the bounds of handles should be used for hit-detection in IE or
     * if <tolerance> > 0. Default is true.
     */
    allowHandleBoundsCheck: boolean;
    /**
     * Optional {@link Image} to be used as handles. Default is null.
     */
    handleImage: Image | null;
    /**
     * If handles are currently visible.
     */
    handlesVisible: boolean;
    /**
     * Optional tolerance for hit-detection in <getHandleForEvent>. Default is 0.
     */
    tolerance: number;
    /**
     * Specifies if a rotation handle should be visible. Default is false.
     */
    rotationEnabled: boolean;
    /**
     * Specifies if the parent should be highlighted if a child cell is selected.
     * Default is false.
     */
    parentHighlightEnabled: boolean;
    /**
     * Specifies if rotation steps should be "rasterized" depening on the distance
     * to the handle. Default is true.
     */
    rotationRaster: boolean;
    /**
     * Specifies the cursor for the rotation handle. Default is 'crosshair'.
     */
    rotationCursor: string;
    /**
     * Specifies if resize should change the cell in-place. This is an experimental
     * feature for non-touch devices. Default is false.
     */
    livePreview: boolean;
    /**
     * Specifies if the live preview should be moved to the front.
     */
    movePreviewToFront: boolean;
    /**
     * Specifies if sizers should be hidden and spaced if the vertex is small.
     * Default is false.
     */
    manageSizers: boolean;
    /**
     * Specifies if the size of groups should be constrained by the children.
     * Default is false.
     */
    constrainGroupByChildren: boolean;
    /**
     * Vertical spacing for rotation icon. Default is -16.
     */
    rotationHandleVSpacing: number;
    /**
     * The horizontal offset for the handles. This is updated in <redrawHandles>
     * if {@link anageSizers} is true and the sizers are offset horizontally.
     */
    horizontalOffset: number;
    /**
     * The horizontal offset for the handles. This is updated in <redrawHandles>
     * if {@link anageSizers} is true and the sizers are offset vertically.
     */
    verticalOffset: number;
    minBounds: Rectangle | null;
    x0: number;
    y0: number;
    customHandles: CellHandle[];
    inTolerance: boolean;
    startX: number;
    startY: number;
    rotationShape: Shape | null;
    currentAlpha: number;
    startAngle: number;
    startDist: number;
    ghostPreview: Shape | null;
    livePreviewActive: boolean;
    childOffsetX: number;
    childOffsetY: number;
    parentState: CellState | null;
    parentHighlight: RectangleShape | null;
    unscaledBounds: Rectangle | null;
    preview: Shape | null;
    labelShape: Shape | null;
    edgeHandlers: EdgeHandler[];
    EMPTY_POINT: Point;
    constructor(state: CellState);
    /**
     * Returns true if the rotation handle should be showing.
     */
    isRotationHandleVisible(): boolean;
    /**
     * Returns true if the aspect ratio if the cell should be maintained.
     */
    isConstrainedEvent(me: InternalMouseEvent): boolean;
    /**
     * Returns true if the center of the vertex should be maintained during the resize.
     */
    isCenteredEvent(state: CellState, me: InternalMouseEvent): boolean;
    /**
     * Returns an array of custom handles. This implementation returns null.
     */
    createCustomHandles(): never[];
    /**
     * Initializes the shapes required for this vertex handler.
     */
    updateMinBounds(): void;
    /**
     * Returns the mxRectangle that defines the bounds of the selection
     * border.
     */
    getSelectionBounds(state: CellState): Rectangle;
    /**
     * Creates the shape used to draw the selection border.
     */
    createParentHighlightShape(bounds: Rectangle): RectangleShape;
    /**
     * Creates the shape used to draw the selection border.
     */
    createSelectionShape(bounds: Rectangle): RectangleShape;
    /**
     * Returns {@link Constants#VERTEX_SELECTION_COLOR}.
     */
    getSelectionColor(): string;
    /**
     * Returns {@link Constants#VERTEX_SELECTION_STROKEWIDTH}.
     */
    getSelectionStrokeWidth(): number;
    /**
     * Returns {@link Constants#VERTEX_SELECTION_DASHED}.
     */
    isSelectionDashed(): boolean;
    /**
     * Creates a sizer handle for the specified cursor and index and returns
     * the new {@link RectangleShape} that represents the handle.
     */
    createSizer(cursor: string, index: number, size?: number, fillColor?: string): RectangleShape | EllipseShape;
    /**
     * Returns true if the sizer for the given index is visible.
     * This returns true for all given indices.
     */
    isSizerVisible(index: number): boolean;
    /**
     * Creates the shape used for the sizer handle for the specified bounds an
     * index. Only images and rectangles should be returned if support for HTML
     * labels with not foreign objects is required.
     */
    createSizerShape(bounds: Rectangle, index: number, fillColor?: string): RectangleShape | EllipseShape;
    /**
     * Helper method to create an {@link Rectangle} around the given centerpoint
     * with a width and height of 2*s or 6, if no s is given.
     */
    moveSizerTo(shape: Shape, x: number, y: number): void;
    /**
     * Returns the index of the handle for the given event. This returns the index
     * of the sizer from where the event originated or {@link Event#LABEL_INDEX}.
     */
    getHandleForEvent(me: InternalMouseEvent): number | null;
    /**
     * Returns true if the given event allows custom handles to be changed. This
     * implementation returns true.
     */
    isCustomHandleEvent(me: InternalMouseEvent): boolean;
    /**
     * Handles the event if a handle has been clicked. By consuming the
     * event all subsequent events of the gesture are redirected to this
     * handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Called if <livePreview> is enabled to check if a border should be painted.
     * This implementation returns true if the shape is transparent.
     */
    isLivePreviewBorder(): boolean | null;
    /**
     * Starts the handling of the mouse gesture.
     */
    start(x: number, y: number, index: number): void;
    /**
     * Starts the handling of the mouse gesture.
     */
    createGhostPreview(): Shape;
    /**
     * Shortcut to <hideSizers>.
     */
    setHandlesVisible(visible: boolean): void;
    /**
     * Hides all sizers except.
     *
     * Starts the handling of the mouse gesture.
     */
    hideSizers(): void;
    /**
     * Checks if the coordinates for the given event are within the
     * {@link Graph#tolerance}. If the event is a mouse event then the tolerance is
     * ignored.
     */
    checkTolerance(me: InternalMouseEvent): void;
    /**
     * Hook for subclassers do show details while the handler is active.
     */
    updateHint(me: InternalMouseEvent): void;
    /**
     * Hooks for subclassers to hide details when the handler gets inactive.
     */
    removeHint(): void;
    /**
     * Hook for rounding the angle. This uses Math.round.
     */
    roundAngle(angle: number): number;
    /**
     * Hook for rounding the unscaled width or height. This uses Math.round.
     */
    roundLength(length: number): number;
    /**
     * Handles the event by updating the preview.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Returns true if a ghost preview should be used for custom handles.
     */
    isGhostPreview(): boolean;
    /**
     * Moves the vertex.
     */
    moveLabel(me: InternalMouseEvent): void;
    /**
     * Rotates the vertex.
     */
    rotateVertex(me: InternalMouseEvent): void;
    /**
     * Resizes the vertex.
     */
    resizeVertex(me: InternalMouseEvent): void;
    /**
     * Repaints the live preview.
     */
    updateLivePreview(me: InternalMouseEvent): void;
    /**
     * Handles the event by applying the changes to the geometry.
     */
    moveToFront(): void;
    /**
     * Handles the event by applying the changes to the geometry.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Returns the `recursiveResize` status of the given state.
     * @param state the given {@link CellState}. This implementation takes the value of this state.
     * @param me the mouse event.
     */
    isRecursiveResize(state: CellState, me: InternalMouseEvent): boolean;
    /**
     * Hook for subclassers to implement a single click on the rotation handle.
     * This code is executed as part of the model transaction. This implementation
     * is empty.
     */
    rotateClick(): void;
    /**
     * Rotates the given cell and its children by the given angle in degrees.
     *
     * @param cell <Cell> to be rotated.
     * @param angle Angle in degrees.
     */
    rotateCell(cell: Cell, angle: number, parent?: Cell): void;
    /**
     * Resets the state of this handler.
     */
    reset(): void;
    /**
     * Uses the given vector to change the bounds of the given cell
     * in the graph using {@link Graph#resizeCell}.
     */
    resizeCell(cell: Cell, dx: number, dy: number, index: number, gridEnabled: boolean, constrained: boolean, recurse: boolean): void;
    /**
     * Moves the children of the given cell by the given vector.
     */
    moveChildren(cell: Cell, dx: number, dy: number): void;
    /**
     * Returns the union of the given bounds and location for the specified
     * handle index.
     *
     * To override this to limit the size of vertex via a minWidth/-Height style,
     * the following code can be used.
     *
     * ```javascript
     * let vertexHandlerUnion = union;
     * union = (bounds, dx, dy, index, gridEnabled, scale, tr, constrained)=>
     * {
     *   let result = vertexHandlerUnion.apply(this, arguments);
     *
     *   result.width = Math.max(result.width, mxUtils.getNumber(this.state.style, 'minWidth', 0));
     *   result.height = Math.max(result.height, mxUtils.getNumber(this.state.style, 'minHeight', 0));
     *
     *   return result;
     * };
     * ```
     *
     * The minWidth/-Height style can then be used as follows:
     *
     * ```javascript
     * graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'minWidth=100;minHeight=100;');
     * ```
     *
     * To override this to update the height for a wrapped text if the width of a vertex is
     * changed, the following can be used.
     *
     * ```javascript
     * let mxVertexHandlerUnion = union;
     * union = (bounds, dx, dy, index, gridEnabled, scale, tr, constrained)=>
     * {
     *   let result = mxVertexHandlerUnion.apply(this, arguments);
     *   let s = this.state;
     *
     *   if (this.graph.isHtmlLabel(s.cell) && (index == 3 || index == 4) &&
     *       s.text != null && s.style.whiteSpace == 'wrap')
     *   {
     *     let label = this.graph.getLabel(s.cell);
     *     let fontSize = mxUtils.getNumber(s.style, 'fontSize', mxConstants.DEFAULT_FONTSIZE);
     *     let ww = result.width / s.view.scale - s.text.spacingRight - s.text.spacingLeft
     *
     *     result.height = mxUtils.getSizeForString(label, fontSize, s.style.fontFamily, ww).height;
     *   }
     *
     *   return result;
     * };
     * ```
     */
    union(bounds: Rectangle, dx: number, dy: number, index: number, gridEnabled: boolean, scale: number, tr: Point, constrained: boolean, centered: boolean): Rectangle;
    /**
     * Redraws the handles and the preview.
     */
    redraw(ignoreHandles?: boolean): void;
    /**
     * Returns the padding to be used for drawing handles for the current <bounds>.
     */
    getHandlePadding(): Point;
    /**
     * Returns the bounds used to paint the resize handles.
     */
    getSizerBounds(): Rectangle;
    /**
     * Redraws the handles. To hide certain handles the following code can be used.
     *
     * ```javascript
     * redrawHandles()
     * {
     *   mxVertexHandlerRedrawHandles.apply(this, arguments);
     *
     *   if (this.sizers != null && this.sizers.length > 7)
     *   {
     *     this.sizers[1].node.style.display = 'none';
     *     this.sizers[6].node.style.display = 'none';
     *   }
     * };
     * ```
     */
    redrawHandles(): void;
    /**
     * Returns true if the given custom handle is visible.
     */
    isCustomHandleVisible(handle: CellHandle): boolean;
    /**
     * Returns an {@link Point} that defines the rotation handle position.
     */
    getRotationHandlePosition(): Point;
    /**
     * Returns true if the parent highlight should be visible. This implementation
     * always returns true.
     */
    isParentHighlightVisible(): boolean;
    /**
     * Updates the highlight of the parent if <parentHighlightEnabled> is true.
     */
    updateParentHighlight(): void;
    /**
     * Redraws the preview.
     */
    drawPreview(): void;
    /**
     * Returns the bounds for the selection border.
     */
    getSelectionBorderBounds(): Rectangle;
    /**
     * Returns true if this handler was destroyed or not initialized.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default VertexHandler;
