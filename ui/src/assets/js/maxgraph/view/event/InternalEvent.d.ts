import CellState from '../cell/CellState';
import { KeyboardEventListener, Listenable, MouseEventListener } from '../../types';
import { Graph } from '../Graph';
/**
 * @class InternalEvent
 *
 * Cross-browser DOM event support. For internal event handling,
 * {@link mxEventSource} and the graph event dispatch loop in {@link graph} are used.
 *
 * ### Memory Leaks:
 *
 * Use this class for adding and removing listeners to/from DOM nodes. The
 * {@link removeAllListeners} function is provided to remove all listeners that
 * have been added using {@link addListener}. The function should be invoked when
 * the last reference is removed in the JavaScript code, typically when the
 * referenced DOM node is removed from the DOM.
 */
declare class InternalEvent {
    /**
     * Binds the function to the specified event on the given element. Use
     * {@link mxUtils.bind} in order to bind the "this" keyword inside the function
     * to a given execution scope.
     */
    static addListener(element: Listenable, eventName: string, funct: MouseEventListener | KeyboardEventListener): void;
    /**
     * Removes the specified listener from the given element.
     */
    static removeListener(element: Listenable, eventName: string, funct: MouseEventListener | KeyboardEventListener): void;
    /**
     * Removes all listeners from the given element.
     */
    static removeAllListeners(element: Listenable): void;
    /**
     * Adds the given listeners for touch, mouse and/or pointer events. If
     * <Client.IS_POINTER> is true then pointer events will be registered,
     * else the respective mouse events will be registered. If <Client.IS_POINTER>
     * is false and <Client.IS_TOUCH> is true then the respective touch events
     * will be registered as well as the mouse events.
     */
    static addGestureListeners(node: Listenable, startListener?: MouseEventListener | null, moveListener?: MouseEventListener | null, endListener?: MouseEventListener | null): void;
    /**
     * Removes the given listeners from mousedown, mousemove, mouseup and the
     * respective touch events if <Client.IS_TOUCH> is true.
     */
    static removeGestureListeners(node: Listenable, startListener: MouseEventListener | null, moveListener: MouseEventListener | null, endListener: MouseEventListener | null): void;
    /**
     * Redirects the mouse events from the given DOM node to the graph dispatch
     * loop using the event and given state as event arguments. State can
     * either be an instance of <CellState> or a function that returns an
     * <CellState>. The down, move, up and dblClick arguments are optional
     * functions that take the trigger event as arguments and replace the
     * default behaviour.
     */
    static redirectMouseEvents(node: Listenable, graph: Graph, state?: CellState | ((evt: Event) => CellState | null) | null, down?: MouseEventListener | null, move?: MouseEventListener | null, up?: MouseEventListener | null, dblClick?: MouseEventListener | null): void;
    /**
     * Removes the known listeners from the given DOM node and its descendants.
     *
     * @param element DOM node to remove the listeners from.
     */
    static release(element: Listenable): void;
    /**
     * Installs the given function as a handler for mouse wheel events. The
     * function has two arguments: the mouse event and a boolean that specifies
     * if the wheel was moved up or down.
     *
     * This has been tested with IE 6 and 7, Firefox (all versions), Opera and
     * Safari. It does currently not work on Safari for Mac.
     *
     * ### Example
     *
     * @example
     * ```javascript
     * mxEvent.addMouseWheelListener(function (evt, up)
     * {
     *   MaxLog.show();
     *   MaxLog.debug('mouseWheel: up='+up);
     * });
     * ```
     *
     * @param funct Handler function that takes the event argument and a boolean up
     * argument for the mousewheel direction.
     * @param target Target for installing the listener in Google Chrome. See
     * https://www.chromestatus.com/features/6662647093133312.
     */
    static addMouseWheelListener(funct: (event: Event, up: boolean, force?: boolean, cx?: number, cy?: number) => void, target: Listenable): void;
    /**
     * Disables the context menu for the given element.
     */
    static disableContextMenu(element: Listenable): void;
    /**
     * Consumes the given event.
     *
     * @param evt Native event to be consumed.
     * @param {boolean} [preventDefault=true] Optional boolean to prevent the default for the event.
     * Default is true.
     * @param {boolean} [stopPropagation=true] Option boolean to stop event propagation. Default is
     * true.
     */
    static consume(evt: Event, preventDefault?: boolean, stopPropagation?: boolean): void;
    /**
     * Index for the label handle in an mxMouseEvent. This should be a negative
     * value that does not interfere with any possible handle indices.
     * @default -1
     */
    static LABEL_HANDLE: number;
    /**
     * Index for the rotation handle in an mxMouseEvent. This should be a
     * negative value that does not interfere with any possible handle indices.
     * @default -2
     */
    static ROTATION_HANDLE: number;
    /**
     * Start index for the custom handles in an mxMouseEvent. This should be a
     * negative value and is the start index which is decremented for each
     * custom handle.
     * @default -100
     */
    static CUSTOM_HANDLE: number;
    /**
     * Start index for the virtual handles in an mxMouseEvent. This should be a
     * negative value and is the start index which is decremented for each
     * virtual handle.
     * This assumes that there are no more
     * than VIRTUAL_HANDLE - CUSTOM_HANDLE custom handles.
     *
     * @default -100000
     */
    static VIRTUAL_HANDLE: number;
    /**
     * Specifies the event name for mouseDown.
     */
    static MOUSE_DOWN: string;
    /**
     * Specifies the event name for mouseMove.
     */
    static MOUSE_MOVE: string;
    /**
     * Specifies the event name for mouseUp.
     */
    static MOUSE_UP: string;
    /**
     * Specifies the event name for activate.
     */
    static ACTIVATE: string;
    /**
     * Specifies the event name for resizeStart.
     */
    static RESIZE_START: string;
    /**
     * Specifies the event name for resize.
     */
    static RESIZE: string;
    /**
     * Specifies the event name for resizeEnd.
     */
    static RESIZE_END: string;
    /**
     * Specifies the event name for moveStart.
     */
    static MOVE_START: string;
    /**
     * Specifies the event name for move.
     */
    static MOVE: string;
    /**
     * Specifies the event name for moveEnd.
     */
    static MOVE_END: string;
    /**
     * Specifies the event name for panStart.
     */
    static PAN_START: string;
    /**
     * Specifies the event name for pan.
     */
    static PAN: string;
    /**
     * Specifies the event name for panEnd.
     */
    static PAN_END: string;
    /**
     * Specifies the event name for minimize.
     */
    static MINIMIZE: string;
    /**
     * Specifies the event name for normalize.
     */
    static NORMALIZE: string;
    /**
     * Specifies the event name for maximize.
     */
    static MAXIMIZE: string;
    /**
     * Specifies the event name for hide.
     */
    static HIDE: string;
    /**
     * Specifies the event name for show.
     */
    static SHOW: string;
    /**
     * Specifies the event name for close.
     */
    static CLOSE: string;
    /**
     * Specifies the event name for destroy.
     */
    static DESTROY: string;
    /**
     * Specifies the event name for refresh.
     */
    static REFRESH: string;
    /**
     * Specifies the event name for size.
     */
    static SIZE: string;
    /**
     * Specifies the event name for select.
     */
    static SELECT: string;
    /**
     * Specifies the event name for fired.
     */
    static FIRED: string;
    /**
     * Specifies the event name for fireMouseEvent.
     */
    static FIRE_MOUSE_EVENT: string;
    /**
     * Specifies the event name for gesture.
     */
    static GESTURE: string;
    /**
     * Specifies the event name for tapAndHold.
     */
    static TAP_AND_HOLD: string;
    /**
     * Specifies the event name for get.
     */
    static GET: string;
    /**
     * Specifies the event name for receive.
     */
    static RECEIVE: string;
    /**
     * Specifies the event name for connect.
     */
    static CONNECT: string;
    /**
     * Specifies the event name for disconnect.
     */
    static DISCONNECT: string;
    /**
     * Specifies the event name for suspend.
     */
    static SUSPEND: string;
    /**
     * Specifies the event name for suspend.
     */
    static RESUME: string;
    /**
     * Specifies the event name for mark.
     */
    static MARK: string;
    /**
     * Specifies the event name for root.
     */
    static ROOT: string;
    /**
     * Specifies the event name for post.
     */
    static POST: string;
    /**
     * Specifies the event name for open.
     */
    static OPEN: string;
    /**
     * Specifies the event name for open.
     */
    static SAVE: string;
    /**
     * Specifies the event name for beforeAddVertex.
     */
    static BEFORE_ADD_VERTEX: string;
    /**
     * Specifies the event name for addVertex.
     */
    static ADD_VERTEX: string;
    /**
     * Specifies the event name for afterAddVertex.
     */
    static AFTER_ADD_VERTEX: string;
    /**
     * Specifies the event name for done.
     */
    static DONE: string;
    /**
     * Specifies the event name for execute.
     */
    static EXECUTE: string;
    /**
     * Specifies the event name for executed.
     */
    static EXECUTED: string;
    /**
     * Specifies the event name for beginUpdate.
     */
    static BEGIN_UPDATE: string;
    /**
     * Specifies the event name for startEdit.
     */
    static START_EDIT: string;
    /**
     * Specifies the event name for endUpdate.
     */
    static END_UPDATE: string;
    /**
     * Specifies the event name for endEdit.
     */
    static END_EDIT: string;
    /**
     * Specifies the event name for beforeUndo.
     */
    static BEFORE_UNDO: string;
    /**
     * Specifies the event name for undo.
     */
    static UNDO: string;
    /**
     * Specifies the event name for redo.
     */
    static REDO: string;
    /**
     * Specifies the event name for change.
     */
    static CHANGE: string;
    /**
     * Specifies the event name for notify.
     */
    static NOTIFY: string;
    /**
     * Specifies the event name for layoutCells.
     */
    static LAYOUT_CELLS: string;
    /**
     * Specifies the event name for click.
     */
    static CLICK: string;
    /**
     * Specifies the event name for scale.
     */
    static SCALE: string;
    /**
     * Specifies the event name for translate.
     */
    static TRANSLATE: string;
    /**
     * Specifies the event name for scaleAndTranslate.
     */
    static SCALE_AND_TRANSLATE: string;
    /**
     * Specifies the event name for up.
     */
    static UP: string;
    /**
     * Specifies the event name for down.
     */
    static DOWN: string;
    /**
     * Specifies the event name for add.
     */
    static ADD: string;
    /**
     * Specifies the event name for remove.
     */
    static REMOVE: string;
    /**
     * Specifies the event name for clear.
     */
    static CLEAR: string;
    /**
     * Specifies the event name for addCells.
     */
    static ADD_CELLS: string;
    /**
     * Specifies the event name for cellsAdded.
     */
    static CELLS_ADDED: string;
    /**
     * Specifies the event name for moveCells.
     */
    static MOVE_CELLS: string;
    /**
     * Specifies the event name for cellsMoved.
     */
    static CELLS_MOVED: string;
    /**
     * Specifies the event name for resizeCells.
     */
    static RESIZE_CELLS: string;
    /**
     * Specifies the event name for cellsResized.
     */
    static CELLS_RESIZED: string;
    /**
     * Specifies the event name for toggleCells.
     */
    static TOGGLE_CELLS: string;
    /**
     * Specifies the event name for cellsToggled.
     */
    static CELLS_TOGGLED: string;
    /**
     * Specifies the event name for orderCells.
     */
    static ORDER_CELLS: string;
    /**
     * Specifies the event name for cellsOrdered.
     */
    static CELLS_ORDERED: string;
    /**
     * Specifies the event name for removeCells.
     */
    static REMOVE_CELLS: string;
    /**
     * Specifies the event name for cellsRemoved.
     */
    static CELLS_REMOVED: string;
    /**
     * Specifies the event name for groupCells.
     */
    static GROUP_CELLS: string;
    /**
     * Specifies the event name for ungroupCells.
     */
    static UNGROUP_CELLS: string;
    /**
     * Specifies the event name for removeCellsFromParent.
     */
    static REMOVE_CELLS_FROM_PARENT: string;
    /**
     * Specifies the event name for foldCells.
     */
    static FOLD_CELLS: string;
    /**
     * Specifies the event name for cellsFolded.
     */
    static CELLS_FOLDED: string;
    /**
     * Specifies the event name for alignCells.
     */
    static ALIGN_CELLS: string;
    /**
     * Specifies the event name for labelChanged.
     */
    static LABEL_CHANGED: string;
    /**
     * Specifies the event name for connectCell.
     */
    static CONNECT_CELL: string;
    /**
     * Specifies the event name for cellConnected.
     */
    static CELL_CONNECTED: string;
    /**
     * Specifies the event name for splitEdge.
     */
    static SPLIT_EDGE: string;
    /**
     * Specifies the event name for flipEdge.
     */
    static FLIP_EDGE: string;
    /**
     * Specifies the event name for startEditing.
     */
    static START_EDITING: string;
    /**
     * Specifies the event name for editingStarted.
     */
    static EDITING_STARTED: string;
    /**
     * Specifies the event name for editingStopped.
     */
    static EDITING_STOPPED: string;
    /**
     * Specifies the event name for addOverlay.
     */
    static ADD_OVERLAY: string;
    /**
     * Specifies the event name for removeOverlay.
     */
    static REMOVE_OVERLAY: string;
    /**
     * Specifies the event name for updateCellSize.
     */
    static UPDATE_CELL_SIZE: string;
    /**
     * Specifies the event name for escape.
     */
    static ESCAPE: string;
    /**
     * Specifies the event name for doubleClick.
     */
    static DOUBLE_CLICK: string;
    /**
     * Specifies the event name for start.
     */
    static START: string;
    /**
     * Specifies the event name for reset.
     */
    static RESET: string;
    /**
     * Threshold for pinch gestures to fire a mouse wheel event.
     * Default value is 10.
     */
    static PINCH_THRESHOLD: number;
}
export default InternalEvent;
