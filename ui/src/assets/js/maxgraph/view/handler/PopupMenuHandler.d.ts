import MaxPopupMenu from '../../gui/MaxPopupMenu';
import { Graph } from '../Graph';
import InternalMouseEvent from '../event/InternalMouseEvent';
import { GraphPlugin } from '../../types';
import EventSource from '../event/EventSource';
import EventObject from '../event/EventObject';
/**
 * Event handler that creates popupmenus.
 *
 * Constructor: mxPopupMenuHandler
 *
 * Constructs an event handler that creates a {@link PopupMenu}.
 */
declare class PopupMenuHandler extends MaxPopupMenu implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    gestureHandler: (sender: EventSource, eo: EventObject) => void;
    inTolerance: boolean;
    popupTrigger: boolean;
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Specifies if cells should be selected if a popupmenu is displayed for
     * them. Default is true.
     */
    selectOnPopup: boolean;
    /**
     * Specifies if cells should be deselected if a popupmenu is displayed for
     * the diagram background. Default is true.
     */
    clearSelectionOnBackground: boolean;
    /**
     * X-coordinate of the mouse down event.
     */
    triggerX: number | null;
    /**
     * Y-coordinate of the mouse down event.
     */
    triggerY: number | null;
    /**
     * Screen X-coordinate of the mouse down event.
     */
    screenX: number | null;
    /**
     * Screen Y-coordinate of the mouse down event.
     */
    screenY: number | null;
    /**
     * Initializes the shapes required for this vertex handler.
     */
    init(): void;
    /**
     * Hook for returning if a cell should be selected for a given {@link MouseEvent}.
     * This implementation returns <selectOnPopup>.
     */
    isSelectOnPopup(me: InternalMouseEvent): boolean;
    /**
     * Handles the event by initiating the panning. By consuming the event all
     * subsequent events of the gesture are redirected to this handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by updating the panning on the graph.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by setting the translation on the view or showing the
     * popupmenu.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Hook to return the cell for the mouse up popup trigger handling.
     */
    getCellForPopupEvent(me: InternalMouseEvent): import("../..").Cell | null;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default PopupMenuHandler;
