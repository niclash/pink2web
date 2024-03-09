import EventSource from './event/EventSource';
import UndoableEdit from './undoable_changes/UndoableEdit';
import Cell from './cell/Cell';
import Geometry from './geometry/Geometry';
import type { CellStyle, FilterFunction } from '../types';
/**
 * Extends {@link EventSource} to implement a graph model. The graph model acts as
 * a wrapper around the cells which are in charge of storing the actual graph
 * datastructure. The model acts as a transactional wrapper with event
 * notification for all changes, whereas the cells contain the atomic
 * operations for updating the actual datastructure.
 *
 * ### Layers
 *
 * The cell hierarchy in the model must have a top-level root cell which
 * contains the layers (typically one default layer), which in turn contain the
 * top-level cells of the layers. This means each cell is contained in a layer.
 * If no layers are required, then all new cells should be added to the default
 * layer.
 *
 * Layers are useful for hiding and showing groups of cells, or for placing
 * groups of cells on top of other cells in the display. To identify a layer,
 * the {@link isLayer} function is used. It returns true if the parent of the given
 * cell is the root of the model.
 *
 * ### Events
 *
 * See events section for more details. There is a new set of events for
 * tracking transactional changes as they happen. The events are called
 * startEdit for the initial beginUpdate, executed for each executed change
 * and endEdit for the terminal endUpdate. The executed event contains a
 * property called change which represents the change after execution.
 *
 * ### Encoding the model
 *
 * #### To encode a graph model, use the following code:
 *
 * ```javascript
 * var enc = new Codec();
 * var node = enc.encode(graph.getDataModel());
 * ```
 *
 * This will create an XML node that contains all the model information.
 *
 * #### Encoding and decoding changes:
 *
 * For the encoding of changes, a graph model listener is required that encodes
 * each change from the given array of changes.
 *
 * ```javascript
 * model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *   var nodes = [];
 *   var codec = new Codec();
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     nodes.push(codec.encode(changes[i]));
 *   }
 *   // do something with the nodes
 * });
 * ```
 *
 * For the decoding and execution of changes, the codec needs a lookup function
 * that allows it to resolve cell IDs as follows:
 *
 * ```javascript
 * var codec = new Codec();
 * codec.lookup(id)
 * {
 *   return model.getCell(id);
 * }
 * ```
 *
 * For each encoded change (represented by a node), the following code can be
 * used to carry out the decoding and create a change object.
 *
 * ```javascript
 * var changes = [];
 * var change = codec.decode(node);
 * change.model = model;
 * change.execute();
 * changes.push(change);
 * ```
 *
 * The changes can then be dispatched using the model as follows.
 *
 * ```javascript
 * var edit = new mxUndoableEdit(model, false);
 * edit.changes = changes;
 *
 * edit.notify()
 * {
 *   edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *   	'edit', edit, 'changes', edit.changes));
 *   edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
 *   	'edit', edit, 'changes', edit.changes));
 * }
 *
 * model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
 * model.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *    'edit', edit, 'changes', changes));
 * ```
 *
 * Event: mxEvent.CHANGE
 *
 * Fires when an undoable edit is dispatched. The `edit` property
 * contains the {@link UndoableEdit}. The `changes` property contains
 * the array of atomic changes inside the undoable edit. The changes property
 * is **deprecated**, please use edit.changes instead.
 *
 * ### Example
 *
 * For finding newly inserted cells, the following code can be used:
 *
 * ```javascript
 * graph.model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     var change = changes[i];
 *
 *     if (change instanceof mxChildChange &&
 *       change.change.previous == null)
 *     {
 *       graph.startEditingAtCell(change.child);
 *       break;
 *     }
 *   }
 * });
 * ```
 *
 * Event: mxEvent.NOTIFY
 *
 * Same as {@link Event#CHANGE}, this event can be used for classes that need to
 * implement a sync mechanism between this model and, say, a remote model. In
 * such a setup, only local changes should trigger a notify event and all
 * changes should trigger a change event.
 *
 * Event: mxEvent.EXECUTE
 *
 * Fires between begin- and endUpdate and after an atomic change was executed
 * in the model. The `change` property contains the atomic change
 * that was executed.
 *
 * Event: mxEvent.EXECUTED
 *
 * Fires between START_EDIT and END_EDIT after an atomic change was executed.
 * The `change` property contains the change that was executed.
 *
 * Event: mxEvent.BEGIN_UPDATE
 *
 * Fires after the {@link updateLevel} was incremented in {@link beginUpdate}. This event
 * contains no properties.
 *
 * Event: mxEvent.START_EDIT
 *
 * Fires after the {@link updateLevel} was changed from 0 to 1. This event
 * contains no properties.
 *
 * Event: mxEvent.END_UPDATE
 *
 * Fires after the {@link updateLevel} was decreased in {@link endUpdate} but before any
 * notification or change dispatching. The `edit` property contains
 * the {@link currentEdit}.
 *
 * Event: mxEvent.END_EDIT
 *
 * Fires after the {@link updateLevel} was changed from 1 to 0. This event
 * contains no properties.
 *
 * Event: mxEvent.BEFORE_UNDO
 *
 * Fires before the change is dispatched after the update level has reached 0
 * in {@link endUpdate}. The `edit` property contains the {@link currentEdit}.
 *
 * Event: mxEvent.UNDO
 *
 * Fires after the change was dispatched in {@link endUpdate}. The `edit`
 * property contains the {@link currentEdit}.
 *
 * @class GraphDataModel
 */
export declare class GraphDataModel extends EventSource {
    /**
     * Holds the root cell, which in turn contains the cells that represent the
     * layers of the diagram as child cells. That is, the actual elements of the
     * diagram are supposed to live in the third generation of cells and below.
     */
    root: Cell | null;
    /**
     * Maps from Ids to cells.
     */
    cells: {
        [key: string]: Cell;
    } | null;
    /**
     * Specifies if edges should automatically be moved into the nearest common
     * ancestor of their terminals. Default is true.
     */
    maintainEdgeParent: boolean;
    /**
     * Specifies if relative edge parents should be ignored for finding the nearest
     * common ancestors of an edge's terminals. Default is true.
     */
    ignoreRelativeEdgeParent: boolean;
    /**
     * Specifies if the model should automatically create Ids for new cells.
     * Default is true.
     */
    createIds: boolean;
    /**
     * Defines the prefix of new Ids. Default is an empty string.
     */
    prefix: string;
    /**
     * Defines the postfix of new Ids. Default is an empty string.
     */
    postfix: string;
    /**
     * Specifies the next Id to be created. Initial value is 0.
     */
    nextId: number;
    /**
     * Holds the changes for the current transaction. If the transaction is
     * closed then a new object is created for this variable using
     * {@link createUndoableEdit}.
     */
    currentEdit: any;
    /**
     * Counter for the depth of nested transactions. Each call to {@link beginUpdate}
     * will increment this number and each call to {@link endUpdate} will decrement
     * it. When the counter reaches 0, the transaction is closed and the
     * respective events are fired. Initial value is 0.
     */
    updateLevel: number;
    /**
     * True if the program flow is currently inside endUpdate.
     */
    endingUpdate: boolean;
    constructor(root?: Cell | null);
    /**
     * Sets a new root using {@link createRoot}.
     */
    clear(): void;
    /**
     * Returns {@link createIds}.
     */
    isCreateIds(): boolean;
    /**
     * Sets {@link createIds}.
     */
    setCreateIds(value: boolean): void;
    /**
     * Creates a new root cell with a default layer (child 0).
     */
    createRoot(): Cell;
    /**
     * Returns the {@link Cell} for the specified Id or null if no cell can be
     * found for the given Id.
     *
     * @param {string} id  A string representing the Id of the cell.
     */
    getCell(id: string): Cell | null;
    filterCells(cells: Cell[], filter: FilterFunction): Cell[];
    getRoot(cell?: Cell | null): Cell | null;
    /**
     * Sets the {@link root} of the model using {@link RootChange} and adds the change to
     * the current transaction. This resets all datastructures in the model and
     * is the preferred way of clearing an existing model. Returns the new
     * root.
     *
     * Example:
     *
     * ```javascript
     * var root = new mxCell();
     * root.insert(new mxCell());
     * model.setRoot(root);
     * ```
     *
     * @param {Cell} root  that specifies the new root.
     */
    setRoot(root: Cell | null): Cell | null;
    /**
     * Inner callback to change the root of the model and update the internal
     * datastructures, such as {@link cells} and {@link nextId}. Returns the previous root.
     *
     * @param {Cell} root  that specifies the new root.
     */
    rootChanged(root: Cell | null): Cell | null;
    /**
     * Returns true if the given cell is the root of the model and a non-null
     * value.
     *
     * @param {Cell} cell  that represents the possible root.
     */
    isRoot(cell?: Cell | null): boolean;
    /**
     * Returns true if {@link isRoot} returns true for the parent of the given cell.
     *
     * @param {Cell} cell  that represents the possible layer.
     */
    isLayer(cell: Cell): boolean;
    /**
     * Returns true if the model contains the given {@link Cell}.
     *
     * @param {Cell} cell  that specifies the cell.
     */
    contains(cell: Cell): boolean;
    /**
     * Adds the specified child to the parent at the given index using
     * {@link ChildChange} and adds the change to the current transaction. If no
     * index is specified then the child is appended to the parent's array of
     * children. Returns the inserted child.
     *
     * @param {Cell} parent  that specifies the parent to contain the child.
     * @param {Cell} child  that specifies the child to be inserted.
     * @param index  Optional integer that specifies the index of the child.
     */
    add(parent: Cell | null, child: Cell | null, index?: number | null): Cell | null;
    /**
     * Inner callback to update {@link cells} when a cell has been added. This
     * implementation resolves collisions by creating new Ids. To change the
     * ID of a cell after it was inserted into the model, use the following
     * code:
     *
     * (code
     * delete model.cells[cell.getId()];
     * cell.setId(newId);
     * model.cells[cell.getId()] = cell;
     * ```
     *
     * If the change of the ID should be part of the command history, then the
     * cell should be removed from the model and a clone with the new ID should
     * be reinserted into the model instead.
     *
     * @param {Cell} cell  that specifies the cell that has been added.
     */
    cellAdded(cell: Cell | null): void;
    /**
     * Hook method to create an Id for the specified cell. This implementation
     * concatenates {@link prefix}, id and {@link postfix} to create the Id and increments
     * {@link nextId}. The cell is ignored by this implementation, but can be used in
     * overridden methods to prefix the Ids with eg. the cell type.
     *
     * @param {Cell} cell  to create the Id for.
     */
    createId(cell: Cell): string;
    /**
     * Updates the parent for all edges that are connected to cell or one of
     * its descendants using {@link updateEdgeParent}.
     */
    updateEdgeParents(cell: Cell, root?: Cell): void;
    /**
     * Inner callback to update the parent of the specified {@link Cell} to the
     * nearest-common-ancestor of its two terminals.
     *
     * @param {Cell} edge  that specifies the edge.
     * @param {Cell} root  that represents the current root of the model.
     */
    updateEdgeParent(edge: Cell, root: Cell): void;
    /**
     * Removes the specified cell from the model using {@link ChildChange} and adds
     * the change to the current transaction. This operation will remove the
     * cell and all of its children from the model. Returns the removed cell.
     *
     * @param {Cell} cell  that should be removed.
     */
    remove(cell: Cell): Cell;
    /**
     * Inner callback to update {@link cells} when a cell has been removed.
     *
     * @param {Cell} cell  that specifies the cell that has been removed.
     */
    cellRemoved(cell: Cell): void;
    /**
     * Inner callback to update the parent of a cell using {@link Cell#insert}
     * on the parent and return the previous parent.
     *
     * @param {Cell} cell  to update the parent for.
     * @param {Cell} parent  that specifies the new parent of the cell.
     * @param index  Optional integer that defines the index of the child
     * in the parent's child array.
     */
    parentForCellChanged(cell: Cell, parent: Cell | null, index: number): Cell;
    /**
     * Sets the source or target terminal of the given {@link Cell} using
     * {@link TerminalChange} and adds the change to the current transaction.
     * This implementation updates the parent of the edge using {@link updateEdgeParent}
     * if required.
     *
     * @param {Cell} edge  that specifies the edge.
     * @param {Cell} terminal  that specifies the new terminal.
     * @param isSource  Boolean indicating if the terminal is the new source or
     * target terminal of the edge.
     */
    setTerminal(edge: Cell, terminal: Cell | null, isSource: boolean): Cell | null;
    /**
     * Sets the source and target {@link Cell} of the given {@link Cell} in a single
     * transaction using {@link setTerminal} for each end of the edge.
     *
     * @param {Cell} edge  that specifies the edge.
     * @param {Cell} source  that specifies the new source terminal.
     * @param {Cell} target  that specifies the new target terminal.
     */
    setTerminals(edge: Cell, source: Cell | null, target: Cell | null): void;
    /**
     * Inner helper function to update the terminal of the edge using
     * {@link Cell#insertEdge} and return the previous terminal.
     *
     * @param {Cell} edge  that specifies the edge to be updated.
     * @param {Cell} terminal  that specifies the new terminal.
     * @param isSource  Boolean indicating if the terminal is the new source or
     * target terminal of the edge.
     */
    terminalForCellChanged(edge: Cell, terminal: Cell | null, isSource?: boolean): Cell | null;
    /**
     * Returns all edges between the given source and target pair. If directed
     * is true, then only edges from the source to the target are returned,
     * otherwise, all edges between the two cells are returned.
     *
     * @param {Cell} source  that defines the source terminal of the edge to be
     * returned.
     * @param {Cell} target  that defines the target terminal of the edge to be
     * returned.
     * @param directed  Optional boolean that specifies if the direction of the
     * edge should be taken into account. Default is false.
     */
    getEdgesBetween(source: Cell, target: Cell, directed?: boolean): Cell[];
    /**
     * Sets the user object of then given {@link Cell} using {@link ValueChange}
     * and adds the change to the current transaction.
     *
     * @param {Cell} cell  whose user object should be changed.
     * @param value  Object that defines the new user object.
     */
    setValue(cell: Cell, value: any): any;
    /**
     * Inner callback to update the user object of the given {@link Cell}
     * using {@link Cell#valueChanged} and return the previous value,
     * that is, the return value of {@link Cell#valueChanged}.
     *
     * To change a specific attribute in an XML node, the following code can be
     * used.
     *
     * ```javascript
     * graph.getDataModel().valueForCellChanged(cell, value)
     * {
     *   var previous = cell.value.getAttribute('label');
     *   cell.value.setAttribute('label', value);
     *
     *   return previous;
     * };
     * ```
     */
    valueForCellChanged(cell: Cell, value: any): any;
    /**
     * Sets the {@link Geometry} of the given {@link Cell}. The actual update
     * of the cell is carried out in {@link geometryForCellChanged}. The
     * {@link GeometryChange} action is used to encapsulate the change.
     *
     * @param {Cell} cell  whose geometry should be changed.
     * @param {Geometry} geometry  that defines the new geometry.
     */
    setGeometry(cell: Cell, geometry: Geometry): Geometry;
    /**
     * Inner callback to update the {@link Geometry} of the given {@link Cell} using
     * {@link Cell#setGeometry} and return the previous {@link Geometry}.
     */
    geometryForCellChanged(cell: Cell, geometry: Geometry | null): Geometry | null;
    /**
     * Sets the style of the given {@link Cell} using {@link StyleChange} and
     * adds the change to the current transaction.
     *
     * @param cell  whose style should be changed.
     * @param style the new cell style to set.
     */
    setStyle(cell: Cell, style: CellStyle): void;
    /**
     * Inner callback to update the style of the given {@link Cell}
     * using {@link Cell#setStyle} and return the previous style.
     *
     * @param {Cell} cell  that specifies the cell to be updated.
     * @param style  String of the form [stylename;|key=value;] to specify
     * the new cell style.
     */
    styleForCellChanged(cell: Cell, style: CellStyle): CellStyle;
    /**
     * Sets the collapsed state of the given {@link Cell} using {@link CollapseChange}
     * and adds the change to the current transaction.
     *
     * @param {Cell} cell  whose collapsed state should be changed.
     * @param collapsed  Boolean that specifies the new collpased state.
     */
    setCollapsed(cell: Cell, collapsed: boolean): boolean;
    /**
     * Inner callback to update the collapsed state of the
     * given {@link Cell} using {@link Cell#setCollapsed} and return
     * the previous collapsed state.
     *
     * @param {Cell} cell  that specifies the cell to be updated.
     * @param collapsed  Boolean that specifies the new collpased state.
     */
    collapsedStateForCellChanged(cell: Cell, collapsed: boolean): boolean;
    /**
     * Sets the visible state of the given {@link Cell} using {@link VisibleChange} and
     * adds the change to the current transaction.
     *
     * @param {Cell} cell  whose visible state should be changed.
     * @param visible  Boolean that specifies the new visible state.
     */
    setVisible(cell: Cell, visible: boolean): boolean;
    /**
     * Inner callback to update the visible state of the
     * given {@link Cell} using {@link Cell#setCollapsed} and return
     * the previous visible state.
     *
     * @param {Cell} cell  that specifies the cell to be updated.
     * @param visible  Boolean that specifies the new visible state.
     */
    visibleStateForCellChanged(cell: Cell, visible: boolean): boolean;
    /**
     * Executes the given edit and fires events if required. The edit object
     * requires an execute function which is invoked. The edit is added to the
     * {@link currentEdit} between {@link beginUpdate} and {@link endUpdate} calls, so that
     * events will be fired if this execute is an individual transaction, that
     * is, if no previous {@link beginUpdate} calls have been made without calling
     * {@link endUpdate}. This implementation fires an {@link execute} event before
     * executing the given change.
     *
     * @param change  Object that described the change.
     */
    execute(change: any): void;
    /**
     * Updates the model in a transaction.
     * This is a shortcut to the usage of {@link beginUpdate} and the {@link endUpdate} methods.
     *
     * ```javascript
     * const model = graph.getDataModel();
     * const parent = graph.getDefaultParent();
     * const index = model.getChildCount(parent);
     * model.batchUpdate(() => {
     *   model.add(parent, v1, index);
     *   model.add(parent, v2, index+1);
     * });
     * ```
     *
     * @param fn the update to be performed in the transaction.
     */
    batchUpdate(fn: () => void): void;
    /**
     * Increments the {@link updateLevel} by one. The event notification
     * is queued until {@link updateLevel} reaches 0 by use of
     * {@link endUpdate}.
     *
     * All changes on {@link GraphDataModel} are transactional,
     * that is, they are executed in a single undoable change
     * on the model (without transaction isolation).
     * Therefore, if you want to combine any
     * number of changes into a single undoable change,
     * you should group any two or more API calls that
     * modify the graph model between {@link beginUpdate}
     * and {@link endUpdate} calls as shown here:
     *
     * ```javascript
     * const model = graph.getDataModel();
     * const parent = graph.getDefaultParent();
     * const index = model.getChildCount(parent);
     * model.beginUpdate();
     * try
     * {
     *   model.add(parent, v1, index);
     *   model.add(parent, v2, index+1);
     * }
     * finally
     * {
     *   model.endUpdate();
     * }
     * ```
     *
     * Of course there is a shortcut for appending a
     * sequence of cells into the default parent:
     *
     * ```javascript
     * graph.addCells([v1, v2]).
     * ```
     */
    beginUpdate(): void;
    /**
     * Decrements the {@link updateLevel} by one and fires an {@link undo}
     * event if the {@link updateLevel} reaches 0. This function
     * indirectly fires a {@link change} event by invoking the notify
     * function on the {@link currentEdit} und then creates a new
     * {@link currentEdit} using {@link createUndoableEdit}.
     *
     * The {@link undo} event is fired only once per edit, whereas
     * the {@link change} event is fired whenever the notify
     * function is invoked, that is, on undo and redo of
     * the edit.
     */
    endUpdate(): void;
    /**
     * Creates a new {@link UndoableEdit} that implements the
     * notify function to fire a {@link change} and {@link notify} event
     * through the {@link UndoableEdit}'s source.
     *
     * @param significant  Optional boolean that specifies if the edit to be created is
     * significant. Default is true.
     */
    createUndoableEdit(significant?: boolean): UndoableEdit;
    /**
     * Merges the children of the given cell into the given target cell inside
     * this model. All cells are cloned unless there is a corresponding cell in
     * the model with the same id, in which case the source cell is ignored and
     * all edges are connected to the corresponding cell in this model. Edges
     * are considered to have no identity and are always cloned unless the
     * cloneAllEdges flag is set to false, in which case edges with the same
     * id in the target model are reconnected to reflect the terminals of the
     * source edges.
     */
    mergeChildren(from: Cell, to: Cell, cloneAllEdges?: boolean): void;
    /**
     * Clones the children of the source cell into the given target cell in
     * this model and adds an entry to the mapping that maps from the source
     * cell to the target cell with the same id or the clone of the source cell
     * that was inserted into this model.
     */
    mergeChildrenImpl(from: Cell, to: Cell, cloneAllEdges: boolean, mapping?: any): void;
    /**
     * Returns a deep clone of the given {@link Cell}` (including
     * the children) which is created using {@link cloneCells}`.
     *
     * @param {Cell} cell  to be cloned.
     */
    cloneCell(cell?: Cell | null, includeChildren?: boolean): Cell | null;
}
export default GraphDataModel;
