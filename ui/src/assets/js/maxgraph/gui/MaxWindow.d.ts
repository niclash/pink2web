import Rectangle from '../view/geometry/Rectangle';
import EventSource from '../view/event/EventSource';
/**
 * Basic window inside a document.
 *
 * Creating a simple window.
 * @example
 *
 * ```javascript
 * var tb = document.createElement('div');
 * var wnd = new MaxWindow('Title', tb, 100, 100, 200, 200, true, true);
 * wnd.setVisible(true);
 * ```
 *
 * Creating a window that contains an iframe.
 * @example
 *
 * ```javascript
 * var frame = document.createElement('iframe');
 * frame.setAttribute('width', '192px');
 * frame.setAttribute('height', '172px');
 * frame.setAttribute('src', 'http://www.example.com/');
 * frame.style.backgroundColor = 'white';
 *
 * var w = document.body.clientWidth;
 * var h = (document.body.clientHeight || document.documentElement.clientHeight);
 * var wnd = new MaxWindow('Title', frame, (w-200)/2, (h-200)/3, 200, 200);
 * wnd.setVisible(true);
 * ```
 *
 * To limit the movement of a window, eg. to keep it from being moved beyond
 * the top, left corner the following method can be overridden (recommended):
 *
 * ```javascript
 * wnd.setLocation(x, y)
 * {
 *   x = Math.max(0, x);
 *   y = Math.max(0, y);
 *   setLocation.apply(this, arguments);
 * };
 * ```
 *
 * Or the following event handler can be used:
 *
 * ```javascript
 * wnd.addListener(mxEvent.MOVE, function(e)
 * {
 *   wnd.setLocation(Math.max(0, wnd.getX()), Math.max(0, wnd.getY()));
 * });
 * ```
 *
 * To keep a window inside the current window:
 *
 * ```javascript
 * mxEvent.addListener(window, 'resize', mxUtils.bind(this, function()
 * {
 *   var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
 *   var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
 *
 *   var x = this.window.getX();
 *   var y = this.window.getY();
 *
 *   if (x + this.window.table.clientWidth > iw)
 *   {
 *     x = Math.max(0, iw - this.window.table.clientWidth);
 *   }
 *
 *   if (y + this.window.table.clientHeight > ih)
 *   {
 *     y = Math.max(0, ih - this.window.table.clientHeight);
 *   }
 *
 *   if (this.window.getX() != x || this.window.getY() != y)
 *   {
 *     this.window.setLocation(x, y);
 *   }
 * }));
 * ```
 *
 * ### Event: mxEvent.MOVE_START
 *
 * Fires before the window is moved. The <code>event</code> property contains
 * the corresponding mouse event.
 *
 * ### Event: mxEvent.MOVE
 *
 * Fires while the window is being moved. The <code>event</code> property
 * contains the corresponding mouse event.
 *
 * ### Event: mxEvent.MOVE_END
 *
 * Fires after the window is moved. The <code>event</code> property contains
 * the corresponding mouse event.
 *
 * ### Event: mxEvent.RESIZE_START
 *
 * Fires before the window is resized. The <code>event</code> property contains
 * the corresponding mouse event.
 *
 * ### Event: mxEvent.RESIZE
 *
 * Fires while the window is being resized. The <code>event</code> property
 * contains the corresponding mouse event.
 *
 * ### Event: mxEvent.RESIZE_END
 *
 * Fires after the window is resized. The <code>event</code> property contains
 * the corresponding mouse event.
 *
 * ### Event: mxEvent.MAXIMIZE
 *
 * Fires after the window is maximized. The <code>event</code> property
 * contains the corresponding mouse event.
 *
 * ### Event: mxEvent.MINIMIZE
 *
 * Fires after the window is minimized. The <code>event</code> property
 * contains the corresponding mouse event.
 *
 * ### Event: mxEvent.NORMALIZE
 *
 * Fires after the window is normalized, that is, it returned from
 * maximized or minimized state. The <code>event</code> property contains the
 * corresponding mouse event.
 *
 * ### Event: mxEvent.ACTIVATE
 *
 * Fires after a window is activated. The <code>previousWindow</code> property
 * contains the previous window. The event sender is the active window.
 *
 * ### Event: mxEvent.SHOW
 *
 * Fires after the window is shown. This event has no properties.
 *
 * ### Event: mxEvent.HIDE
 *
 * Fires after the window is hidden. This event has no properties.
 *
 * ### Event: mxEvent.CLOSE
 *
 * Fires before the window is closed. The <code>event</code> property contains
 * the corresponding mouse event.
 *
 * ### Event: mxEvent.DESTROY
 *
 * Fires before the window is destroyed. This event has no properties.
 *
 * @class MaxWindow
 * @extends EventSource
 */
declare class MaxWindow extends EventSource {
    constructor(title: string, content: HTMLElement | null, x: number, y: number, width?: number | null, height?: number | null, minimizable?: boolean, movable?: boolean, replaceNode?: HTMLElement | null, style?: string);
    static activeWindow: MaxWindow | null;
    td: HTMLElement;
    div: HTMLElement;
    table: HTMLElement;
    resize: HTMLElement;
    buttons: HTMLElement;
    minimize: HTMLElement;
    maximize: HTMLElement;
    closeImg: HTMLElement;
    contentWrapper: HTMLElement;
    image: HTMLImageElement;
    /**
     * Initializes the DOM tree that represents the window.
     */
    init(x: number, y: number, width?: number | null, height?: number | null, style?: string): void;
    /**
     * URL of the image to be used for the close icon in the titlebar.
     */
    closeImage: string;
    /**
     * URL of the image to be used for the minimize icon in the titlebar.
     */
    minimizeImage: string;
    /**
     * URL of the image to be used for the normalize icon in the titlebar.
     */
    normalizeImage: string;
    /**
     * URL of the image to be used for the maximize icon in the titlebar.
     */
    maximizeImage: string;
    /**
     * URL of the image to be used for the resize icon.
     */
    resizeImage: string;
    /**
     * Boolean flag that represents the visible state of the window.
     */
    visible: boolean;
    /**
     * {@link Rectangle} that specifies the minimum width and height of the window.
     * Default is (50, 40).
     */
    minimumSize: Rectangle;
    /**
     * Specifies if the window should be destroyed when it is closed. If this
     * is false then the window is hidden using <setVisible>. Default is true.
     */
    destroyOnClose: boolean;
    /**
     * Reference to the DOM node (TD) that contains the title.
     */
    title: HTMLElement;
    /**
     * Reference to the DOM node that represents the window content.
     */
    content: HTMLElement;
    /**
     * Sets the window title to the given string. HTML markup inside the title
     * will be escaped.
     */
    setTitle(title: string): void;
    /**
     * Sets if the window contents should be scrollable.
     */
    setScrollable(scrollable: boolean): void;
    /**
     * Puts the window on top of all other windows.
     */
    activate(): void;
    /**
     * Returuns the outermost DOM node that makes up the window.
     */
    getElement(): HTMLElement;
    /**
     * Makes sure the window is inside the client area of the window.
     */
    fit(): void;
    /**
     * Returns true if the window is resizable.
     */
    isResizable(): boolean;
    /**
     * Sets if the window should be resizable. To avoid interference with some
     * built-in features of IE10 and later, the use of the following code is
     * recommended if there are resizable <MaxWindow>s in the page:
     *
     * ```javascript
     * if (Client.IS_POINTER)
     * {
     *   document.body.style.msTouchAction = 'none';
     * }
     * ```
     */
    setResizable(resizable: boolean): void;
    /**
     * Sets the size of the window.
     */
    setSize(width: number, height: number): void;
    /**
     * Sets if the window is minimizable.
     */
    setMinimizable(minimizable: boolean): void;
    /**
     * Returns an {@link Rectangle} that specifies the size for the minimized window.
     * A width or height of 0 means keep the existing width or height. This
     * implementation returns the height of the window title and keeps the width.
     */
    getMinimumSize(): Rectangle;
    /**
     * Installs the event listeners required for minimizing the window.
     */
    installMinimizeHandler(): void;
    /**
     * Sets if the window is maximizable.
     */
    setMaximizable(maximizable: boolean): void;
    /**
     * Installs the event listeners required for maximizing the window.
     */
    installMaximizeHandler(): void;
    /**
     * Installs the event listeners required for moving the window.
     */
    installMoveHandler(): void;
    /**
     * Sets the upper, left corner of the window.
     */
    setLocation(x: number, y: number): void;
    /**
     * Returns the current position on the x-axis.
     */
    getX(): number;
    /**
     * Returns the current position on the y-axis.
     */
    getY(): number;
    /**
     * Adds the <closeImage> as a new image node in <closeImg> and installs the
     * <close> event.
     */
    installCloseHandler(): void;
    /**
     * Sets the image associated with the window.
     *
     *
     * @param image - URL of the image to be used.
     */
    setImage(image: string): void;
    /**
     * Sets the image associated with the window.
     *
     *
     * @param closable - Boolean specifying if the window should be closable.
     */
    setClosable(closable: boolean): void;
    /**
     * Returns true if the window is visible.
     */
    isVisible(): boolean;
    /**
     * Shows or hides the window depending on the given flag.
     *
     *
     * @param visible - Boolean indicating if the window should be made visible.
     */
    setVisible(visible: boolean): void;
    /**
     * Shows the window.
     */
    show(): void;
    /**
     * Hides the window.
     */
    hide(): void;
    /**
     * Destroys the window and removes all associated resources. Fires a
     * <destroy> event prior to destroying the window.
     */
    destroy(): void;
}
/**
 * Shows the specified text content in a new <MaxWindow> or a new browser
 * window if isInternalWindow is false.
 *
 * @param content String that specifies the text to be displayed.
 * @param isInternalWindow Optional boolean indicating if an MaxWindow should be
 * used instead of a new browser window. Default is false.
 */
export declare const popup: (content: string, isInternalWindow?: boolean) => void;
/**
 * Displays the given error message in a new <MaxWindow> of the given width.
 * If close is true then an additional close button is added to the window.
 * The optional icon specifies the icon to be used for the window. Default
 * is {@link Utils#errorImage}.
 *
 * @param message String specifying the message to be displayed.
 * @param width Integer specifying the width of the window.
 * @param close Optional boolean indicating whether to add a close button.
 * @param icon Optional icon for the window decoration.
 */
export declare const error: (message: string, width: number, close: boolean, icon?: string | null) => MaxWindow;
export default MaxWindow;
