import RectangleShape from '../geometry/node/RectangleShape';
import mxGuide from '../other/Guide';
import Point from '../geometry/Point';
import Dictionary from '../../util/Dictionary';
import CellHighlight from '../cell/CellHighlight';
import Rectangle from '../geometry/Rectangle';
import { Graph } from '../Graph';
import Guide from '../other/Guide';
import Shape from '../geometry/Shape';
import InternalMouseEvent from '../event/InternalMouseEvent';
import Cell from '../cell/Cell';
import EventSource from '../event/EventSource';
import CellState from '../cell/CellState';
import EventObject from '../event/EventObject';
import type { ColorValue, GraphPlugin } from '../../types';
/**
 * Graph event handler that handles selection. Individual cells are handled
 * separately using {@link VertexHandler} or one of the edge handlers. These
 * handlers are created using {@link Graph#createHandler} in
 * {@link GraphSelectionModel#cellAdded}.
 *
 * To avoid the container to scroll a moved cell into view, set {@link scrollOnMove} to `false`.
 *
 * Constructs an event handler that creates handles for the selection cells.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 */
declare class SelectionHandler implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    panHandler: () => void;
    escapeHandler: (sender: EventSource, evt: EventObject) => void;
    refreshHandler: (sender: EventSource, evt: EventObject) => void;
    keyHandler: (e: KeyboardEvent) => void;
    refreshThread: number | null;
    /**
     * Defines the maximum number of cells to paint subhandles
     * for. Default is 50 for Firefox and 20 for IE. Set this
     * to 0 if you want an unlimited number of handles to be
     * displayed. This is only recommended if the number of
     * cells in the graph is limited to a small number, eg.
     * 500.
     */
    maxCells: number;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Specifies if drop targets under the mouse should be enabled. Default is
     * true.
     */
    highlightEnabled: boolean;
    /**
     * Specifies if cloning by control-drag is enabled. Default is true.
     */
    cloneEnabled: boolean;
    /**
     * Specifies if moving is enabled. Default is true.
     */
    moveEnabled: boolean;
    /**
     * Specifies if other cells should be used for snapping the right, center or
     * left side of the current selection. Default is false.
     */
    guidesEnabled: boolean;
    /**
     * Whether the handles of the selection are currently visible.
     */
    handlesVisible: boolean;
    /**
     * Holds the {@link Guide} instance that is used for alignment.
     */
    guide: Guide | null;
    /**
     * Stores the x-coordinate of the current mouse move.
     */
    currentDx: number;
    /**
     * Stores the y-coordinate of the current mouse move.
     */
    currentDy: number;
    /**
     * Specifies if a move cursor should be shown if the mouse is over a movable
     * cell. Default is true.
     */
    updateCursor: boolean;
    /**
     * Specifies if selecting is enabled. Default is true.
     */
    selectEnabled: boolean;
    /**
     * Specifies if cells may be moved out of their parents. Default is true.
     */
    removeCellsFromParent: boolean;
    /**
     * If empty parents should be removed from the model after all child cells
     * have been moved out. Default is true.
     */
    removeEmptyParents: boolean;
    /**
     * Specifies if drop events are interpreted as new connections if no other
     * drop action is defined. Default is false.
     */
    connectOnDrop: boolean;
    /**
     * Specifies if the view should be scrolled so that a moved cell is visible.
     * @default true
     */
    scrollOnMove: boolean;
    /**
     * Specifies the minimum number of pixels for the width and height of a
     * selection border. Default is 6.
     */
    minimumSize: number;
    /**
     * Specifies the color of the preview shape. Default is black.
     */
    previewColor: ColorValue;
    /**
     * Specifies if the graph container should be used for preview. If this is used
     * then drop target detection relies entirely on {@link Graph#getCellAt} because
     * the HTML preview does not "let events through". Default is false.
     */
    htmlPreview: boolean;
    /**
     * Reference to the {@link Shape} that represents the preview.
     */
    shape: Shape | null;
    /**
     * Specifies if the grid should be scaled. Default is false.
     */
    scaleGrid: boolean;
    /**
     * Specifies if the bounding box should allow for rotation. Default is true.
     */
    rotationEnabled: boolean;
    /**
     * Maximum number of cells for which live preview should be used.  Default is 0 which means no live preview.
     */
    maxLivePreview: number;
    /**
     * Variable allowLivePreview
     *
     * If live preview is allowed on this system.  Default is true for systems with SVG support.
     */
    allowLivePreview: boolean;
    cell: Cell | null;
    delayedSelection: boolean;
    first: Point | null;
    cells: Cell[] | null;
    bounds: Rectangle | null;
    pBounds: Rectangle | null;
    allCells: Dictionary<Cell, CellState>;
    cellWasClicked: boolean;
    cloning: boolean;
    cellCount: number;
    target: Cell | null;
    suspended: boolean;
    livePreviewActive: boolean;
    livePreviewUsed: boolean;
    highlight: CellHighlight | null;
    /**
     * Returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Sets <enabled>.
     */
    setEnabled(value: boolean): void;
    /**
     * Returns <cloneEnabled>.
     */
    isCloneEnabled(): boolean;
    /**
     * Sets <cloneEnabled>.
     *
     * @param value Boolean that specifies the new clone enabled state.
     */
    setCloneEnabled(value: boolean): void;
    /**
     * Returns {@link oveEnabled}.
     */
    isMoveEnabled(): boolean;
    /**
     * Sets {@link oveEnabled}.
     */
    setMoveEnabled(value: boolean): void;
    /**
     * Returns <selectEnabled>.
     */
    isSelectEnabled(): boolean;
    /**
     * Sets <selectEnabled>.
     */
    setSelectEnabled(value: boolean): void;
    /**
     * Returns <removeCellsFromParent>.
     */
    isRemoveCellsFromParent(): boolean;
    /**
     * Sets <removeCellsFromParent>.
     */
    setRemoveCellsFromParent(value: boolean): void;
    /**
     * Returns true if the given cell and parent should propagate
     * selection state to the parent.
     */
    isPropagateSelectionCell(cell: Cell, immediate: boolean, me: InternalMouseEvent): boolean;
    /**
     * Hook to return initial cell for the given event.
     */
    getInitialCellForEvent(me: InternalMouseEvent): Cell | null;
    /**
     * Hook to return true for delayed selections.
     */
    isDelayedSelection(cell: Cell, me: InternalMouseEvent): boolean;
    /**
     * Implements the delayed selection for the given mouse event.
     */
    selectDelayed(me: InternalMouseEvent): void;
    /**
     * Selects the given cell for the given {@link MouseEvent}.
     */
    selectCellForEvent(cell: Cell, me: InternalMouseEvent): Cell;
    /**
     * Consumes the given mouse event. NOTE: This may be used to enable click
     * events for links in labels on iOS as follows as consuming the initial
     * touchStart disables firing the subsequent click evnent on the link.
     *
     * <code>
     * consumeMouseEvent(evtName, me)
     * {
     *   var source = mxEvent.getSource(me.getEvent());
     *
     *   if (!mxEvent.isTouchEvent(me.getEvent()) || source.nodeName != 'A')
     *   {
     *     me.consume();
     *   }
     * }
     * </code>
     */
    consumeMouseEvent(evtName: string, me: InternalMouseEvent): void;
    /**
     * Handles the event by selecing the given cell and creating a handle for
     * it. By consuming the event all subsequent events of the gesture are
     * redirected to this handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Creates an array of cell states which should be used as guides.
     */
    getGuideStates(): CellState[];
    /**
     * Returns the cells to be modified by this handler. This implementation
     * returns all selection cells that are movable, or the given initial cell if
     * the given cell is not selected and movable. This handles the case of moving
     * unselectable or unselected cells.
     *
     * @param initialCell <Cell> that triggered this handler.
     */
    getCells(initialCell: Cell): Cell[];
    /**
     * Returns the {@link Rectangle} used as the preview bounds for
     * moving the given cells.
     */
    getPreviewBounds(cells: Cell[]): Rectangle | null;
    /**
     * Returns the union of the {@link CellStates} for the given array of {@link Cells}.
     * For vertices, this method uses the bounding box of the corresponding shape
     * if one exists. The bounding box of the corresponding text label and all
     * controls and overlays are ignored. See also: {@link GraphView#getBounds} and
     * {@link Graph#getBoundingBox}.
     *
     * @param cells Array of {@link Cells} whose bounding box should be returned.
     */
    getBoundingBox(cells: Cell[]): Rectangle | null;
    /**
     * Creates the shape used to draw the preview for the given bounds.
     */
    createPreviewShape(bounds: Rectangle): RectangleShape;
    createGuide(): mxGuide;
    /**
     * Starts the handling of the mouse gesture.
     */
    start(cell: Cell, x: number, y: number, cells?: Cell[]): void;
    /**
     * Adds the states for the given cell recursively to the given dictionary.
     * @param cell
     * @param dict
     */
    addStates(cell: Cell, dict: Dictionary<Cell, CellState>): number;
    /**
     * Returns true if the given cell is currently being moved.
     */
    isCellMoving(cell: Cell): CellState | null;
    /**
     * Returns true if the guides should be used for the given {@link MouseEvent}.
     * This implementation returns {@link Guide#isEnabledForEvent}.
     */
    useGuidesForEvent(me: InternalMouseEvent): boolean;
    /**
     * Snaps the given vector to the grid and returns the given mxPoint instance.
     */
    snap(vector: Point): Point;
    /**
     * Returns an {@link Point} that represents the vector for moving the cells
     * for the given {@link MouseEvent}.
     */
    getDelta(me: InternalMouseEvent): Point;
    /**
     * Hook for subclassers do show details while the handler is active.
     */
    updateHint(me?: InternalMouseEvent): void;
    /**
     * Hooks for subclassers to hide details when the handler gets inactive.
     */
    removeHint(): void;
    /**
     * Hook for rounding the unscaled vector. This uses Math.round.
     */
    roundLength(length: number): number;
    /**
     * Returns true if the given cell is a valid drop target.
     */
    isValidDropTarget(target: Cell, me: InternalMouseEvent): boolean;
    /**
     * Updates the preview if cloning state has changed.
     */
    checkPreview(): void;
    /**
     * Handles the event by highlighting possible drop targets and updating the
     * preview.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Updates the bounds of the preview shape.
     */
    updatePreview(remote?: boolean): void;
    /**
     * Updates the bounds of the preview shape.
     */
    updatePreviewShape(): void;
    /**
     * Updates the bounds of the preview shape.
     */
    updateLivePreview(dx: number, dy: number): void;
    /**
     * Redraws the preview shape for the given states array.
     */
    redrawHandles(states: CellState[][]): void;
    /**
     * Resets the given preview states array.
     */
    resetPreviewStates(states: CellState[][]): void;
    /**
     * Suspends the livew preview.
     */
    suspend(): void;
    /**
     * Suspends the livew preview.
     */
    resume(): void;
    /**
     * Resets the livew preview.
     */
    resetLivePreview(): void;
    /**
     * Sets wether the handles attached to the given cells are visible.
     *
     * @param cells Array of {@link Cells}.
     * @param visible Boolean that specifies if the handles should be visible.
     * @param force Forces an update of the handler regardless of the last used value.
     */
    setHandlesVisibleForCells(cells: Cell[], visible: boolean, force?: boolean): void;
    /**
     * Sets the color of the rectangle used to highlight drop targets.
     *
     * @param color String that represents the new highlight color.
     */
    setHighlightColor(color: ColorValue): void;
    /**
     * Handles the event by applying the changes to the selection cells.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Resets the state of this handler.
     */
    reset(): void;
    /**
     * Returns true if the given cells should be removed from the parent for the specified
     * mousereleased event.
     */
    shouldRemoveCellsFromParent(parent: Cell, cells: Cell[], evt: MouseEvent): boolean;
    /**
     * Moves the given cells by the specified amount.
     */
    moveCells(cells: Cell[], dx: number, dy: number, clone: boolean, target: Cell | null, evt: MouseEvent): void;
    /**
     * Returns true if the given parent should be removed after removal of child cells.
     */
    shouldRemoveParent(parent: Cell): boolean;
    /**
     * Destroy the preview and highlight shapes.
     */
    destroyShapes(): void;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default SelectionHandler;
