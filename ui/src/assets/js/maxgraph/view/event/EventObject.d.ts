type EventProperties = Record<string, any>;
/**
 * The mxEventObject is a wrapper for all properties of a single event.
 * Additionally, it also offers functions to consume the event and check if it
 * was consumed as follows:
 *
 * ```javascript
 * evt.consume();
 * INV: evt.isConsumed() == true
 * ```
 *
 * Constructor: mxEventObject
 *
 * Constructs a new event object with the specified name. An optional
 * sequence of key, value pairs can be appended to define properties.
 *
 * Example:
 *
 * ```javascript
 * new mxEventObject("eventName", key1, val1, .., keyN, valN)
 * ```
 */
declare class EventObject {
    constructor(name?: string, ...args: any[]);
    /**
     * Holds the name.
     */
    name: string;
    /**
     * Holds the properties as an associative array.
     */
    properties: EventProperties;
    /**
     * Holds the consumed state. Default is false.
     */
    consumed: boolean;
    /**
     * Returns <name>.
     */
    getName(): string;
    /**
     * Returns <properties>.
     */
    getProperties(): EventProperties;
    /**
     * Returns the property for the given key.
     */
    getProperty(key: string): any;
    /**
     * Returns true if the event has been consumed.
     */
    isConsumed(): boolean;
    /**
     * Consumes the event.
     */
    consume(): void;
}
export default EventObject;
