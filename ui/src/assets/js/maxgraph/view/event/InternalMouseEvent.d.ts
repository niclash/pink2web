import CellState from '../cell/CellState';
import Shape from '../geometry/Shape';
/**
 * Base class for all mouse events in mxGraph. A listener for this event should
 * implement the following methods:
 *
 * ```javascript
 * graph.addMouseListener(
 * {
 *   mouseDown: (sender, evt)=>
 *   {
 *     MaxLog.debug('mouseDown');
 *   },
 *   mouseMove: (sender, evt)=>
 *   {
 *     MaxLog.debug('mouseMove');
 *   },
 *   mouseUp: (sender, evt)=>
 *   {
 *     MaxLog.debug('mouseUp');
 *   }
 * });
 * ```
 *
 * Constructor: mxMouseEvent
 *
 * Constructs a new event object for the given arguments.
 *
 * @param evt Native mouse event.
 * @param state Optional <CellState> under the mouse.
 */
declare class InternalMouseEvent {
    constructor(evt: MouseEvent, state?: CellState | null);
    /**
     * Holds the consumed state of this event.
     */
    consumed: boolean;
    /**
     * Holds the inner event object.
     */
    evt: MouseEvent;
    /**
     * Holds the x-coordinate of the event in the graph. This value is set in
     * {@link Graph#fireMouseEvent}.
     */
    graphX: number;
    /**
     * Holds the y-coordinate of the event in the graph. This value is set in
     * {@link Graph#fireMouseEvent}.
     */
    graphY: number;
    /**
     * Holds the optional <CellState> associated with this event.
     */
    state: CellState | null;
    /**
     * Holds the <CellState> that was passed to the constructor. This can be
     * different from <state> depending on the result of {@link Graph#getEventState}.
     */
    sourceState: CellState | null;
    /**
     * Returns <evt>.
     */
    getEvent(): MouseEvent;
    /**
     * Returns the target DOM element using {@link Event#getSource} for <evt>.
     */
    getSource(): Element;
    /**
     * Returns true if the given {@link Shape} is the source of <evt>.
     */
    isSource(shape: Shape | null): boolean;
    /**
     * Returns <evt.clientX>.
     */
    getX(): number;
    /**
     * Returns <evt.clientY>.
     */
    getY(): number;
    /**
     * Returns <graphX>.
     */
    getGraphX(): number;
    /**
     * Returns <graphY>.
     */
    getGraphY(): number;
    /**
     * Returns <state>.
     */
    getState(): CellState | null;
    /**
     * Returns the <Cell> in <state> is not null.
     */
    getCell(): import("../..").Cell | null;
    /**
     * Returns true if the event is a popup trigger.
     */
    isPopupTrigger(): boolean;
    /**
     * Returns <consumed>.
     */
    isConsumed(): boolean;
    /**
     * Sets <consumed> to true and invokes preventDefault on the native event
     * if such a method is defined. This is used mainly to avoid the cursor from
     * being changed to a text cursor in Webkit. You can use the preventDefault
     * flag to disable this functionality.
     *
     * @param preventDefault Specifies if the native event should be canceled. Default
     * is true.
     */
    consume(preventDefault?: boolean): void;
}
export default InternalMouseEvent;
