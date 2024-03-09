import EventSource from '../event/EventSource';
import Cell from '../cell/Cell';
import Rectangle from '../geometry/Rectangle';
import { Graph } from '../Graph';
import GraphLayout from './GraphLayout';
import UndoableEdit from '../undoable_changes/UndoableEdit';
/**
 * @class LayoutManager
 * @extends {EventSource}
 *
 * Implements a layout manager that runs a given layout after any changes to the graph:
 *
 * ### Example
 *
 * ```javascript
 * var layoutMgr = new mxLayoutManager(graph);
 * layoutMgr.getLayout(cell, eventName)
 * {
 *   return layout;
 * };
 * ```
 *
 * See {@link getLayout} for a description of the possible eventNames.
 *
 * #### Event: mxEvent.LAYOUT_CELLS
 *
 * Fires between begin- and endUpdate after all cells have been layouted in
 * {@link layoutCells}. The `cells` property contains all cells that have
 * been passed to {@link layoutCells}.
 */
declare class LayoutManager extends EventSource {
    /**
     * Reference to the enclosing {@link graph}.
     */
    graph: Graph;
    /**
     * Specifies if the layout should bubble along
     * the cell hierarchy.
     * @default true
     */
    bubbling: boolean;
    /**
     * Specifies if event handling is enabled.
     * @default true
     */
    enabled: boolean;
    /**
     * Holds the function that handles the endUpdate event.
     */
    undoHandler: (...args: any[]) => any;
    /**
     * Holds the function that handles the move event.
     */
    moveHandler: (...args: any[]) => any;
    /**
     * Holds the function that handles the resize event.
     */
    resizeHandler: (...args: any[]) => any;
    constructor(graph: Graph);
    /**
     * Returns true if events are handled. This implementation
     * returns {@link enabled}.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation
     * updates {@link enabled}.
     *
     * @param enabled Boolean that specifies the new enabled state.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns true if a layout should bubble, that is, if the parent layout
     * should be executed whenever a cell layout (layout of the children of
     * a cell) has been executed. This implementation returns {@link bubbling}.
     */
    isBubbling(): boolean;
    /**
     * Sets {@link bubbling}.
     */
    setBubbling(value: boolean): void;
    /**
     * Returns the graph that this layout operates on.
     */
    getGraph(): Graph;
    /**
     * Sets the graph that the layouts operate on.
     */
    setGraph(graph: Graph | null): void;
    /**
     * Returns true if the given cell has a layout. This implementation invokes
     * <getLayout> with {@link Event#LAYOUT_CELLS} as the eventName. Override this
     * if creating layouts in <getLayout> is expensive and return true if
     * <getLayout> will return a layout for the given cell for
     * {@link Event#BEGIN_UPDATE} or {@link Event#END_UPDATE}.
     */
    hasLayout(cell: Cell | null): boolean;
    /**
     * Returns the layout for the given cell and eventName. Possible
     * event names are {@link InternalEvent.MOVE_CELLS} and {@link InternalEvent.RESIZE_CELLS}
     * for callbacks on when cells are moved or resized and
     * {@link InternalEvent.BEGIN_UPDATE} and {@link InternalEvent.END_UPDATE} for the capture
     * and bubble phase of the layout after any changes of the model.
     */
    getLayout(cell: Cell | null, eventName: string): GraphLayout | null;
    /**
     * Called from {@link undoHandler}.
     *
     * @param cell Array of {@link Cell} that have been moved.
     * @param evt Mouse event that represents the mousedown.
     *
     * TODO: what is undoableEdit type?
     */
    beforeUndo(undoableEdit: UndoableEdit): void;
    /**
     * Called from {@link moveHandler}.
     *
     * @param cell Array of {@link Cell} that have been moved.
     * @param evt Mouse event that represents the mousedown.
     */
    cellsMoved(cells: Cell[], evt: MouseEvent): void;
    /**
     * Called from {@link resizeHandler}.
     *
     * @param cell Array of {@link Cell} that have been resized.
     * @param bounds {@link mxRectangle} taht represents the new bounds.
     */
    cellsResized(cells?: Cell[] | null, bounds?: Rectangle[] | null, prev?: Cell[] | null): void;
    /**
     * Returns the cells for which a layout should be executed.
     */
    getCellsForChanges(changes: any[]): Cell[];
    /**
     * Executes all layouts which have been scheduled during the
     * changes.
     * @param change  mxChildChange|mxTerminalChange|mxVisibleChange|...
     */
    getCellsForChange(change: any): Cell[];
    /**
     * Adds all ancestors of the given cell that have a layout.
     */
    addCellsWithLayout(cell: Cell | null, result?: Cell[]): Cell[];
    /**
     * Adds all ancestors of the given cell that have a layout.
     */
    addAncestorsWithLayout(cell: Cell | null, result?: Cell[]): Cell[];
    /**
     * Adds all descendants of the given cell that have a layout.
     */
    addDescendantsWithLayout(cell: Cell | null, result?: Cell[]): Cell[];
    /**
     * Executes the given layout on the given parent.
     */
    executeLayoutForCells(cells: Cell[]): void;
    /**
     * Executes all layouts which have been scheduled during the changes.
     */
    layoutCells(cells: Cell[], bubble?: boolean): void;
    /**
     * Executes the given layout on the given parent.
     */
    executeLayout(cell: Cell, bubble?: boolean): void;
    /**
     * Removes all handlers from the {@link graph} and deletes the reference to it.
     */
    destroy(): void;
}
export default LayoutManager;
