import Point from '../geometry/Point';
import InternalMouseEvent from '../event/InternalMouseEvent';
import { Graph } from '../Graph';
import { GraphPlugin } from '../../types';
import EventSource from '../event/EventSource';
/**
 * Event handler that selects rectangular regions.
 * This is not built-into [mxGraph].
 * To enable rubberband selection in a graph, use the following code.
 */
declare class RubberBandHandler implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    forceRubberbandHandler: Function;
    panHandler: Function;
    gestureHandler: Function;
    graph: Graph;
    first: Point | null;
    destroyed: boolean;
    dragHandler: ((evt: MouseEvent) => void) | null;
    dropHandler: ((evt: MouseEvent) => void) | null;
    x: number;
    y: number;
    width: number;
    height: number;
    /**
     * Specifies the default opacity to be used for the rubberband div.  Default is 20.
     */
    defaultOpacity: number;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Holds the DIV element which is currently visible.
     */
    div: HTMLElement | null;
    /**
     * Holds the DIV element which is used to display the rubberband.
     */
    sharedDiv: HTMLElement | null;
    /**
     * Holds the value of the x argument in the last call to <update>.
     */
    currentX: number;
    /**
     * Holds the value of the y argument in the last call to <update>.
     */
    currentY: number;
    /**
     * Optional fade out effect.  Default is false.
     */
    fadeOut: boolean;
    /**
     * Creates the rubberband selection shape.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation updates
     * <enabled>.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns true if the given {@link MouseEvent} should start rubberband selection.
     * This implementation returns true if the alt key is pressed.
     */
    isForceRubberbandEvent(me: InternalMouseEvent): boolean;
    /**
     * Handles the event by initiating a rubberband selection. By consuming the
     * event all subsequent events of the gesture are redirected to this
     * handler.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Creates the rubberband selection shape.
     */
    start(x: number, y: number): void;
    /**
     * Handles the event by updating therubberband selection.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Creates the rubberband selection shape.
     */
    createShape(): HTMLElement;
    /**
     * Returns true if this handler is active.
     */
    isActive(sender?: EventSource, me?: InternalMouseEvent): boolean | null;
    /**
     * Handles the event by selecting the region of the rubberband using
     * {@link Graph#selectRegion}.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Resets the state of this handler and selects the current region
     * for the given event.
     */
    execute(evt: MouseEvent): void;
    /**
     * Resets the state of the rubberband selection.
     */
    reset(): void;
    /**
     * Sets <currentX> and <currentY> and calls <repaint>.
     */
    update(x: number, y: number): void;
    /**
     * Computes the bounding box and updates the style of the <div>.
     */
    repaint(): void;
    /**
     * Destroys the handler and all its resources and DOM nodes. This does
     * normally not need to be called, it is called automatically when the
     * window unloads.
     */
    onDestroy(): void;
}
export default RubberBandHandler;
