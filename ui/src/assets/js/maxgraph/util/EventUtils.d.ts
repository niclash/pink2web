/**
 * Returns the touch or mouse event that contains the mouse coordinates.
 */
export declare const getMainEvent: (evt: MouseEvent) => MouseEvent;
/**
 * Returns true if the meta key is pressed for the given event.
 */
export declare const getClientX: (evt: MouseEvent) => number;
/**
 * Returns true if the meta key is pressed for the given event.
 */
export declare const getClientY: (evt: MouseEvent) => number;
/**
 * Returns the event's target or srcElement depending on the browser.
 */
export declare const getSource: (evt: MouseEvent | KeyboardEvent) => EventTarget | null;
/**
 * Returns true if the event has been consumed using {@link consume}.
 */
export declare const isConsumed: (evt: MouseEvent | KeyboardEvent) => any;
/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
export declare const isTouchEvent: (evt: MouseEvent) => boolean;
/**
 * Returns true if the event was generated using a pen (not a touch device or mouse).
 */
export declare const isPenEvent: (evt: MouseEvent) => boolean;
/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
export declare const isMultiTouchEvent: (evt: MouseEvent) => any;
/**
 * Returns true if the event was generated using a mouse (not a pen or touch device).
 */
export declare const isMouseEvent: (evt: Event) => boolean;
/**
 * Returns true if the left mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property. Note that this returns true in Firefox
 * for control+left-click on the Mac.
 */
export declare const isLeftMouseButton: (evt: MouseEvent) => boolean;
/**
 * Returns true if the middle mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property.
 */
export declare const isMiddleMouseButton: (evt: MouseEvent) => boolean;
/**
 * Returns true if the right mouse button was pressed. Note that this
 * button might not be available on some systems. For handling a popup
 * trigger {@link isPopupTrigger} should be used.
 */
export declare const isRightMouseButton: (evt: MouseEvent) => boolean;
/**
 * Returns true if the event is a popup trigger. This implementation
 * returns true if the right button or the left button and control was
 * pressed on a Mac.
 */
export declare const isPopupTrigger: (evt: MouseEvent) => boolean;
/**
 * Returns true if the shift key is pressed for the given event.
 */
export declare const isShiftDown: (evt: MouseEvent | KeyboardEvent) => boolean;
/**
 * Returns true if the alt key is pressed for the given event.
 */
export declare const isAltDown: (evt: MouseEvent | KeyboardEvent) => boolean;
/**
 * Returns true if the control key is pressed for the given event.
 */
export declare const isControlDown: (evt: MouseEvent | KeyboardEvent) => boolean;
/**
 * Returns true if the meta key is pressed for the given event.
 */
export declare const isMetaDown: (evt: MouseEvent | KeyboardEvent) => boolean;
