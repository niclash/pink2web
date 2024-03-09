import EventSource from '../event/EventSource';
import Dictionary from '../../util/Dictionary';
import EventObject from '../event/EventObject';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
import CellState from '../cell/CellState';
import { GraphPlugin } from '../../types';
import EdgeHandler from './EdgeHandler';
import VertexHandler from './VertexHandler';
import InternalMouseEvent from '../event/InternalMouseEvent';
/**
 * An event handler that manages cell handlers and invokes their mouse event
 * processing functions.
 *
 * Group: Events
 *
 * Event: mxEvent.ADD
 *
 * Fires if a cell has been added to the selection. The <code>state</code>
 * property contains the <CellState> that has been added.
 *
 * Event: mxEvent.REMOVE
 *
 * Fires if a cell has been remove from the selection. The <code>state</code>
 * property contains the <CellState> that has been removed.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 */
declare class SelectionCellsHandler extends EventSource implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Keeps a reference to an event listener for later removal.
     */
    refreshHandler: (sender: EventSource, evt: EventObject) => void;
    /**
     * Defines the maximum number of handlers to paint individually. Default is 100.
     */
    maxHandlers: number;
    /**
     * {@link Dictionary} that maps from cells to handlers.
     */
    handlers: Dictionary<Cell, EdgeHandler | VertexHandler>;
    /**
     * Returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Sets <enabled>.
     */
    setEnabled(value: boolean): void;
    /**
     * Returns the handler for the given cell.
     */
    getHandler(cell: Cell): NonNullable<EdgeHandler | VertexHandler> | null;
    /**
     * Returns true if the given cell has a handler.
     */
    isHandled(cell: Cell): boolean;
    /**
     * Resets all handlers.
     */
    reset(): void;
    /**
     * Reloads or updates all handlers.
     */
    getHandledSelectionCells(): Cell[];
    /**
     * Reloads or updates all handlers.
     */
    refresh(): void;
    /**
     * Returns true if the given handler is active and should not be redrawn.
     */
    isHandlerActive(handler: EdgeHandler | VertexHandler): boolean;
    /**
     * Updates the handler for the given shape if one exists.
     */
    updateHandler(state: CellState): void;
    /**
     * Redirects the given event to the handlers.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Redirects the given event to the handlers.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Redirects the given event to the handlers.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default SelectionCellsHandler;
