import { Graph } from '../Graph';
import CellState from '../cell/CellState';
import InternalMouseEvent from '../event/InternalMouseEvent';
import type { GraphPlugin } from '../../types';
import EventSource from '../event/EventSource';
/**
 * Graph event handler that displays tooltips.
 *
 * {@link Graph#getTooltip} is used to get the tooltip for a cell or handle.
 *
 * This handler is generally enabled using {@link Graph#setTooltips}.
 */
declare class TooltipHandler implements GraphPlugin {
    static pluginId: string;
    /**
     * Constructs an event handler that displays tooltips.
     *
     * @param graph Reference to the enclosing {@link Graph}.
     */
    constructor(graph: Graph);
    div: HTMLElement;
    /**
     * Specifies the zIndex for the tooltip and its shadow.
     * @default 10005
     */
    zIndex: number;
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Delay to show the tooltip in milliseconds.
     * @default 500
     */
    delay: number;
    /**
     * Specifies if touch and pen events should be ignored.
     * @default true
     */
    ignoreTouchEvents: boolean;
    /**
     * Specifies if the tooltip should be hidden if the mouse is moved over the current cell.
     * @default false
     */
    hideOnHover: boolean;
    /**
     * `true` if this handler was destroyed using {@link onDestroy}.
     */
    destroyed: boolean;
    lastX: number;
    lastY: number;
    state: CellState | null;
    stateSource: boolean;
    node: any;
    thread: number | null;
    /**
     * Specifies if events are handled.
     * @default false
     */
    enabled: boolean;
    /**
     * Returns `true` if events are handled.
     *
     * This implementation returns {@link enabled}.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling.
     *
     * This implementation updates {@link enabled}.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns {@link hideOnHover}.
     */
    isHideOnHover(): boolean;
    /**
     * Sets <hideOnHover>.
     */
    setHideOnHover(value: boolean): void;
    /**
     * Returns the <CellState> to be used for showing a tooltip for this event.
     */
    getStateForEvent(me: InternalMouseEvent): CellState | null;
    /**
     * Handles the event by initiating a rubberband selection. By consuming the
     * event all subsequent events of the gesture are redirected to this
     * handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by updating the rubberband selection.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by resetting the tooltip timer or hiding the existing
     * tooltip.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Resets the timer.
     */
    resetTimer(): void;
    /**
     * Resets and/or restarts the timer to trigger the display of the tooltip.
     */
    reset(me: InternalMouseEvent, restart: boolean, state?: CellState | null): void;
    /**
     * Hides the tooltip and resets the timer.
     */
    hide(): void;
    /**
     * Hides the tooltip.
     */
    hideTooltip(): void;
    /**
     * Shows the tooltip for the specified cell and optional index at the
     * specified location (with a vertical offset of 10 pixels).
     */
    show(tip: HTMLElement | string | null, x: number, y: number): void;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy(): void;
}
export default TooltipHandler;
