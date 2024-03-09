import InternalMouseEvent from '../event/InternalMouseEvent';
import Point from '../geometry/Point';
import Rectangle from '../geometry/Rectangle';
import RectangleShape from '../geometry/node/RectangleShape';
import { Graph } from '../Graph';
import Image from '../image/ImageBox';
import EventObject from '../event/EventObject';
import EventSource from '../event/EventSource';
/**
 * @class Outline
 *
 * Implements an outline (aka overview) for a graph. Set {@link updateOnPan} to true
 * to enable updates while the source graph is panning.
 *
 * ### Example
 *
 * ```javascript
 * var outline = new mxOutline(graph, div);
 * ```
 *
 * If an outline is used in an {@link MaxWindow} in IE8 standards mode, the following
 * code makes sure that the shadow filter is not inherited and that any
 * transparent elements in the graph do not show the page background, but the
 * background of the graph container.
 *
 * ```javascript
 * if (document.documentMode == 8)
 * {
 *   container.style.filter = 'progid:DXImageTransform.Microsoft.alpha(opacity=100)';
 * }
 * ```
 *
 * To move the graph to the top, left corner the following code can be used.
 *
 * ```javascript
 * var scale = graph.view.scale;
 * var bounds = graph.getGraphBounds();
 * graph.view.setTranslate(-bounds.x / scale, -bounds.y / scale);
 * ```
 *
 * To toggle the suspended mode, the following can be used.
 *
 * ```javascript
 * outline.suspended = !outln.suspended;
 * if (!outline.suspended)
 * {
 *   outline.update(true);
 * }
 * ```
 */
declare class Outline {
    constructor(source: Graph, container?: HTMLElement | null);
    /**
     * Initializes the outline inside the given container.
     */
    init(container: HTMLElement): void;
    sizer: RectangleShape | null;
    selectionBorder: RectangleShape | null;
    updateHandler: ((sender: any, evt: EventObject) => void) | null;
    refreshHandler: ((sender: any, evt: EventObject) => void) | null;
    panHandler: ((sender: any, evt: EventObject) => void) | null;
    active: boolean | null;
    bounds: Rectangle | null;
    zoom: boolean;
    startX: number | null;
    startY: number | null;
    dx0: number | null;
    dy0: number | null;
    index: number | null;
    /**
     * Reference to the source {@link graph}.
     */
    source: Graph;
    /**
     * Reference to the {@link graph} that renders the outline.
     */
    outline: Graph | null;
    /**
     * Renderhint to be used for the outline graph.
     * @default faster
     */
    graphRenderHint: string;
    /**
     * Specifies if events are handled.
     * @default true
     */
    enabled: boolean;
    /**
     * Specifies a viewport rectangle should be shown.
     * @default true
     */
    showViewport: boolean;
    /**
     * Border to be added at the bottom and right.
     * @default 10
     */
    border: number;
    /**
     * Specifies the size of the sizer handler.
     * @default 8
     */
    sizerSize: number;
    /**
     * Specifies if labels should be visible in the outline.
     * @default false
     */
    labelsVisible: boolean;
    /**
     * Specifies if {@link update} should be called for {@link InternalEvent.PAN} in the source
     * graph.
     * @default false
     */
    updateOnPan: boolean;
    /**
     * Optional {@link Image} to be used for the sizer.
     * @default null
     */
    sizerImage: Image | null;
    /**
     * Minimum scale to be used.
     * @default 0.0001
     */
    minScale: number;
    /**
     * Optional boolean flag to suspend updates. This flag will
     * also suspend repaints of the outline. To toggle this switch, use the
     * following code.
     *
     * @default false
     *
     * @example
     * ```javascript
     * nav.suspended = !nav.suspended;
     *
     * if (!nav.suspended)
     * {
     *   nav.update(true);
     * }
     * ```
     */
    suspended: boolean;
    /**
     * Creates the {@link graph} used in the outline.
     */
    createGraph(container: HTMLElement): Graph;
    /**
     * Returns true if events are handled. This implementation
     * returns {@link enabled}.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation
     * updates {@link enabled}.
     *
     * @param value Boolean that specifies the new enabled state.
     */
    setEnabled(value: boolean): void;
    /**
     * Enables or disables the zoom handling by showing or hiding the respective
     * handle.
     *
     * @param value Boolean that specifies the new enabled state.
     */
    setZoomEnabled(value: boolean): void;
    /**
     * Invokes {@link update} and revalidate the outline. This method is deprecated.
     */
    refresh(): void;
    /**
     * Creates the shape used as the sizer.
     */
    createSizer(): RectangleShape;
    /**
     * Returns the size of the source container.
     */
    getSourceContainerSize(): Rectangle;
    /**
     * Returns the offset for drawing the outline graph.
     */
    getOutlineOffset(scale?: number): Point | null;
    /**
     * Returns the offset for drawing the outline graph.
     */
    getSourceGraphBounds(): Rectangle;
    /**
     * Updates the outline.
     */
    update(revalidate?: boolean): void;
    /**
     * Handles the event by starting a translation or zoom.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by previewing the viewrect in {@link graph} and updating the
     * rectangle that represents the viewrect in the outline.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Gets the translate for the given mouse event. Here is an example to limit
     * the outline to stay within positive coordinates:
     *
     * @example
     * ```javascript
     * outline.getTranslateForEvent(me)
     * {
     *   var pt = new mxPoint(me.getX() - this.startX, me.getY() - this.startY);
     *
     *   if (!this.zoom)
     *   {
     *     var tr = this.source.view.translate;
     *     pt.x = Math.max(tr.x * this.outline.view.scale, pt.x);
     *     pt.y = Math.max(tr.y * this.outline.view.scale, pt.y);
     *   }
     *
     *   return pt;
     * };
     * ```
     */
    getTranslateForEvent(me: InternalMouseEvent): Point;
    /**
     * Handles the event by applying the translation or zoom to {@link graph}.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Destroy this outline and removes all listeners from {@link source}.
     */
    destroy(): void;
}
export default Outline;
