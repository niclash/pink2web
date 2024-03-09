import EventObject from './EventObject';
type EventListenerObject = {
    funct: Function;
    name: string;
};
/**
 * Base class for objects that dispatch named events. To create a subclass that
 * inherits from mxEventSource, the following code is used.
 *
 * ```javascript
 * function MyClass() { };
 *
 * MyClass.prototype = new mxEventSource();
 * constructor = MyClass;
 * ```
 *
 * Known Subclasses:
 *
 * <Transactions>, {@link Graph}, {@link GraphView}, <Editor>, <CellOverlay>,
 * <MaxToolbar>, <MaxWindow>
 *
 * Constructor: mxEventSource
 *
 * Constructs a new event source.
 */
declare class EventSource {
    constructor(eventSource?: EventTarget | null);
    /**
     * Holds the event names and associated listeners in an array. The array
     * contains the event name followed by the respective listener for each
     * registered listener.
     */
    eventListeners: EventListenerObject[];
    /**
     * Specifies if events can be fired. Default is true.
     */
    eventsEnabled: boolean;
    /**
     * Optional source for events. Default is null.
     */
    eventSource: EventTarget | null;
    /**
     * Returns <eventsEnabled>.
     */
    isEventsEnabled(): boolean;
    /**
     * Sets <eventsEnabled>.
     */
    setEventsEnabled(value: boolean): void;
    /**
     * Returns <eventSource>.
     */
    getEventSource(): EventTarget | null;
    /**
     * Sets <eventSource>.
     */
    setEventSource(value: EventTarget | null): void;
    /**
     * Binds the specified function to the given event name. If no event name
     * is given, then the listener is registered for all events.
     *
     * The parameters of the listener are the sender and an {@link EventObject}.
     */
    addListener(name: string, funct: Function): void;
    /**
     * Removes all occurrences of the given listener from <eventListeners>.
     */
    removeListener(funct: Function): void;
    /**
     * Dispatches the given event to the listeners which are registered for
     * the event. The sender argument is optional. The current execution scope
     * ("this") is used for the listener invocation (see {@link Utils#bind}).
     *
     * Example:
     *
     * ```javascript
     * fireEvent(new mxEventObject("eventName", key1, val1, .., keyN, valN))
     * ```
     *
     * @param evt {@link EventObject} that represents the event.
     * @param sender Optional sender to be passed to the listener. Default value is
     * the return value of <getEventSource>.
     */
    fireEvent(evt: EventObject, sender?: EventTarget | null): void;
}
export default EventSource;
