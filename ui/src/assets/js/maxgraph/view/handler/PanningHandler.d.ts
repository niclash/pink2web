import EventSource from '../event/EventSource';
import EventObject from '../event/EventObject';
import PanningManager from '../other/PanningManager';
import InternalMouseEvent from '../event/InternalMouseEvent';
import type { GraphPlugin, MouseEventListener } from '../../types';
import type { Graph } from '../Graph';
/**
 * Event handler that pans and creates popupmenus. To use the left
 * mousebutton for panning without interfering with cell moving and
 * resizing, use <isUseLeftButton> and <isIgnoreCell>. For grid size
 * steps while panning, use <useGrid>. This handler is built-into
 * {@link Graph#panningHandler} and enabled using {@link Graph#setPanning}.
 *
 * Constructor: mxPanningHandler
 *
 * Constructs an event handler that creates a {@link PopupMenu}
 * and pans the graph.
 *
 * Event: mxEvent.PAN_START
 *
 * Fires when the panning handler changes its <active> state to true. The
 * <code>event</code> property contains the corresponding {@link MouseEvent}.
 *
 * Event: mxEvent.PAN
 *
 * Fires while handle is processing events. The <code>event</code> property contains
 * the corresponding {@link MouseEvent}.
 *
 * Event: mxEvent.PAN_END
 *
 * Fires when the panning handler changes its <active> state to false. The
 * <code>event</code> property contains the corresponding {@link MouseEvent}.
 */
declare class PanningHandler extends EventSource implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    panningManager: PanningManager;
    getPanningManager: () => PanningManager;
    /**
     * Specifies if panning should be active for the left mouse button.
     * Setting this to true may conflict with {@link Rubberband}. Default is false.
     */
    useLeftButtonForPanning: boolean;
    /**
     * Specifies if {@link Event#isPopupTrigger} should also be used for panning.
     */
    usePopupTrigger: boolean;
    /**
     * Specifies if panning should be active even if there is a cell under the
     * mousepointer. Default is false.
     */
    ignoreCell: boolean;
    /**
     * Specifies if the panning should be previewed. Default is true.
     */
    previewEnabled: boolean;
    /**
     * Specifies if the panning steps should be aligned to the grid size.
     * Default is false.
     */
    useGrid: boolean;
    /**
     * Specifies if panning should be enabled. Default is false.
     */
    panningEnabled: boolean;
    /**
     * Specifies if pinch gestures should be handled as zoom. Default is true.
     */
    pinchEnabled: boolean;
    initialScale: number;
    /**
     * Specifies the maximum scale. Default is 8.
     */
    maxScale: number;
    /**
     * Specifies the minimum scale. Default is 0.01.
     */
    minScale: number;
    /**
     * Holds the current horizontal offset.
     */
    dx: number;
    /**
     * Holds the current vertical offset.
     */
    dy: number;
    /**
     * Holds the x-coordinate of the start point.
     */
    startX: number;
    /**
     * Holds the y-coordinate of the start point.
     */
    startY: number;
    dx0: number;
    dy0: number;
    panningTrigger: boolean;
    active: boolean;
    forcePanningHandler: (sender: EventSource, evt: EventObject) => void;
    gestureHandler: (sender: EventSource, evt: EventObject) => void;
    mouseUpListener: MouseEventListener;
    mouseDownEvent: InternalMouseEvent | null;
    /**
     * Returns true if the handler is currently active.
     */
    isActive(): boolean;
    /**
     * Returns <panningEnabled>.
     */
    isPanningEnabled(): boolean;
    /**
     * Sets <panningEnabled>.
     */
    setPanningEnabled(value: boolean): void;
    /**
     * Returns <pinchEnabled>.
     */
    isPinchEnabled(): boolean;
    /**
     * Sets <pinchEnabled>.
     */
    setPinchEnabled(value: boolean): void;
    /**
     * Returns true if the given event is a panning trigger for the optional
     * given cell. This returns true if control-shift is pressed or if
     * <usePopupTrigger> is true and the event is a popup trigger.
     */
    isPanningTrigger(me: InternalMouseEvent): boolean;
    /**
     * Returns true if the given {@link MouseEvent} should start panning. This
     * implementation always returns true if <ignoreCell> is true or for
     * multi touch events.
     */
    isForcePanningEvent(me: InternalMouseEvent): any;
    /**
     * Handles the event by initiating the panning. By consuming the event all
     * subsequent events of the gesture are redirected to this handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Starts panning at the given event.
     */
    start(me: InternalMouseEvent): void;
    /**
     * Consumes the given {@link MouseEvent} if it was a panning trigger in
     * {@link ouseDown}. The default is to invoke {@link MouseEvent#consume}. Note that this
     * will block any further event processing. If you haven't disabled built-in
     * context menus and require immediate selection of the cell on mouseDown in
     * Safari and/or on the Mac, then use the following code:
     *
     * ```javascript
     * consumePanningTrigger(me)
     * {
     *   if (me.evt.preventDefault)
     *   {
     *     me.evt.preventDefault();
     *   }
     *
     *   // Stops event processing in IE
     *   me.evt.returnValue = false;
     *
     *   // Sets local consumed state
     *   if (!Client.IS_SF && !Client.IS_MAC)
     *   {
     *     me.consumed = true;
     *   }
     * };
     * ```
     */
    consumePanningTrigger(me: InternalMouseEvent): void;
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
     * Zooms the graph to the given value and consumed the event if needed.
     */
    zoomGraph(evt: Event): void;
    /**
     * Handles the event by setting the translation on the view or showing the
     * popupmenu.
     */
    reset(): void;
    /**
     * Pans <graph> by the given amount.
     */
    panGraph(dx: number, dy: number): void;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default PanningHandler;
