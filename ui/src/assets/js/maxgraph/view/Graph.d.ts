import Image from './image/ImageBox';
import EventSource from './event/EventSource';
import Rectangle from './geometry/Rectangle';
import GraphView from './GraphView';
import CellRenderer from './cell/CellRenderer';
import Point from './geometry/Point';
import Cell from './cell/Cell';
import GraphDataModel from './GraphDataModel';
import { Stylesheet } from './style/Stylesheet';
import CellState from './cell/CellState';
import EdgeHandler from './handler/EdgeHandler';
import VertexHandler from './handler/VertexHandler';
import EdgeSegmentHandler from './handler/EdgeSegmentHandler';
import ElbowEdgeHandler from './handler/ElbowEdgeHandler';
import type { EdgeStyleFunction, GraphPlugin, GraphPluginConstructor, MouseListenerSet } from '../types';
import Multiplicity from './other/Multiplicity';
import ImageBundle from './image/ImageBundle';
import GraphSelectionModel from './GraphSelectionModel';
export declare const defaultPlugins: GraphPluginConstructor[];
/**
 * Extends {@link EventSource} to implement a graph component for the browser. This is the main class of the package.
 *
 * To activate panning and connections use {@link setPanning} and {@link setConnectable}.
 * For rubberband selection you must create a new instance of {@link rubberband}.
 *
 * The following listeners are added to {@link mouseListeners} by default:
 *
 * - tooltipHandler: {@link TooltipHandler} that displays tooltips
 * - panningHandler: {@link PanningHandler} for panning and popup menus
 * - connectionHandler: {@link ConnectionHandler} for creating connections
 * - selectionHandler: {@link SelectionHandler} for moving and cloning cells
 *
 * These listeners will be called in the above order if they are enabled.
 */
declare class Graph extends EventSource {
    container: HTMLElement;
    destroyed: boolean;
    graphModelChangeListener: Function | null;
    paintBackground: Function | null;
    foldingEnabled: null | boolean;
    isConstrainedMoving: boolean;
    cells: Cell[];
    imageBundles: ImageBundle[];
    /**
     * Holds the mouse event listeners. See {@link fireMouseEvent}.
     */
    mouseListeners: MouseListenerSet[];
    /**
     * An array of {@link Multiplicity} describing the allowed
     * connections in a graph.
     */
    multiplicities: Multiplicity[];
    /**
     * Holds the {@link GraphDataModel} that contains the cells to be displayed.
     */
    model: GraphDataModel;
    plugins: GraphPluginConstructor[];
    pluginsMap: Record<string, GraphPlugin>;
    /**
     * Holds the {@link GraphView} that caches the {@link CellState}s for the cells.
     */
    view: GraphView;
    /**
     * Holds the {@link Stylesheet} that defines the appearance of the cells.
     *
     * Use the following code to read a stylesheet into an existing graph.
     *
     * @example
     * ```javascript
     * var req = mxUtils.load('stylesheet.xml');
     * var root = req.getDocumentElement();
     * var dec = new Codec(root.ownerDocument);
     * dec.decode(root, graph.stylesheet);
     * ```
     */
    stylesheet: Stylesheet;
    /**
     * Holds the {@link CellRenderer} for rendering the cells in the graph.
     */
    cellRenderer: CellRenderer;
    /**
     * RenderHint as it was passed to the constructor.
     */
    renderHint: string | null;
    /**
     * Dialect to be used for drawing the graph. Possible values are all
     * constants in {@link mxConstants} with a DIALECT-prefix.
     */
    dialect: 'svg' | 'mixedHtml' | 'preferHtml' | 'strictHtml';
    /**
     * Value returned by {@link getOverlap} if {@link isAllowOverlapParent} returns
     * `true` for the given cell. {@link getOverlap} is used in {@link constrainChild} if
     * {@link isConstrainChild} returns `true`. The value specifies the
     * portion of the child which is allowed to overlap the parent.
     */
    defaultOverlap: number;
    /**
     * Specifies the default parent to be used to insert new cells.
     * This is used in {@link getDefaultParent}.
     * @default null
     */
    defaultParent: Cell | null;
    /**
     * Specifies the {@link Image} to be returned by {@link getBackgroundImage}.
     * @default null
     *
     * @example
     * ```javascript
     * var img = new mxImage('http://www.example.com/maps/examplemap.jpg', 1024, 768);
     * graph.setBackgroundImage(img);
     * graph.view.validate();
     * ```
     */
    backgroundImage: Image | null;
    /**
     * Specifies if the background page should be visible.
     * Not yet implemented.
     * @default false
     */
    pageVisible: boolean;
    /**
     * Specifies if a dashed line should be drawn between multiple pages.
     * If you change this value while a graph is being displayed then you
     * should call {@link sizeDidChange} to force an update of the display.
     * @default false
     */
    pageBreaksVisible: boolean;
    /**
     * Specifies the color for page breaks.
     * @default gray
     */
    pageBreakColor: string;
    /**
     * Specifies the page breaks should be dashed.
     * @default true
     */
    pageBreakDashed: boolean;
    /**
     * Specifies the minimum distance in pixels for page breaks to be visible.
     * @default 20
     */
    minPageBreakDist: number;
    /**
     * Specifies if the graph size should be rounded to the next page number in
     * {@link sizeDidChange}. This is only used if the graph container has scrollbars.
     * @default false
     */
    preferPageSize: boolean;
    /**
     * Specifies the page format for the background page.
     * This is used as the default in {@link printPreview} and for painting the background page
     * if {@link pageVisible} is `true` and the page breaks if {@link pageBreaksVisible} is `true`.
     * @default {@link mxConstants.PAGE_FORMAT_A4_PORTRAIT}
     */
    pageFormat: Rectangle;
    /**
     * Specifies the scale of the background page.
     * Not yet implemented.
     * @default 1.5
     */
    pageScale: number;
    /**
     * Specifies the return value for {@link isEnabled}.
     * @default true
     */
    enabled: boolean;
    /**
     * Specifies the return value for {@link canExportCell}.
     * @default true
     */
    exportEnabled: boolean;
    /**
     * Specifies the return value for {@link canImportCell}.
     * @default true
     */
    importEnabled: boolean;
    /**
     * Specifies if the graph should automatically scroll regardless of the
     * scrollbars. This will scroll the container using positive values for
     * scroll positions (ie usually only rightwards and downwards). To avoid
     * possible conflicts with panning, set {@link translateToScrollPosition} to `true`.
     */
    ignoreScrollbars: boolean;
    /**
     * Specifies if the graph should automatically convert the current scroll
     * position to a translate in the graph view when a mouseUp event is received.
     * This can be used to avoid conflicts when using {@link autoScroll} and
     * {@link ignoreScrollbars} with no scrollbars in the container.
     */
    translateToScrollPosition: boolean;
    /**
     * {@link Rectangle} that specifies the area in which all cells in the diagram
     * should be placed. Uses in {@link getMaximumGraphBounds}. Use a width or height of
     * `0` if you only want to give a upper, left corner.
     */
    maximumGraphBounds: Rectangle | null;
    /**
     * {@link Rectangle} that specifies the minimum size of the graph. This is ignored
     * if the graph container has no scrollbars.
     * @default null
     */
    minimumGraphSize: Rectangle | null;
    /**
     * {@link Rectangle} that specifies the minimum size of the {@link container} if
     * {@link resizeContainer} is `true`.
     */
    minimumContainerSize: Rectangle | null;
    /**
     * {@link Rectangle} that specifies the maximum size of the container if
     * {@link resizeContainer} is `true`.
     */
    maximumContainerSize: Rectangle | null;
    /**
     * Specifies if the container should be resized to the graph size when
     * the graph size has changed.
     * @default false
     */
    resizeContainer: boolean;
    /**
     * Border to be added to the bottom and right side when the container is
     * being resized after the graph has been changed.
     * @default 0
     */
    border: number;
    /**
     * Specifies if edges should appear in the foreground regardless of their order
     * in the model. If {@link keepEdgesInForeground} and {@link keepEdgesInBackground} are
     * both `true` then the normal order is applied.
     * @default false
     */
    keepEdgesInForeground: boolean;
    /**
     * Specifies if edges should appear in the background regardless of their order
     * in the model. If {@link keepEdgesInForeground} and {@link keepEdgesInBackground} are
     * both `true` then the normal order is applied.
     * @default false
     */
    keepEdgesInBackground: boolean;
    /**
     * Specifies the return value for {@link isRecursiveResize}.
     * @default false (for backwards compatibility)
     */
    recursiveResize: boolean;
    /**
     * Specifies if the scale and translate should be reset if the root changes in
     * the model.
     * @default true
     */
    resetViewOnRootChange: boolean;
    /**
     * Specifies if loops (aka self-references) are allowed.
     * @default false
     */
    allowLoops: boolean;
    /**
     * {@link EdgeStyle} to be used for loops. This is a fallback for loops if the
     * {@link CellStateStyle.loopStyle} is `undefined`.
     * @default {@link EdgeStyle.Loop}
     */
    defaultLoopStyle: EdgeStyleFunction;
    /**
     * Specifies if multiple edges in the same direction between the same pair of
     * vertices are allowed.
     * @default true
     */
    multigraph: boolean;
    /**
     * Specifies the minimum scale to be applied in {@link fit}. Set this to `null` to allow any value.
     * @default 0.1
     */
    minFitScale: number;
    /**
     * Specifies the maximum scale to be applied in {@link fit}. Set this to `null` to allow any value.
     * @default 8
     */
    maxFitScale: number;
    /**
     * Specifies the {@link Image} for the image to be used to display a warning
     * overlay. See {@link setCellWarning}. Default value is Client.imageBasePath +
     * '/warning'.  The extension for the image depends on the platform. It is
     * '.png' on the Mac and '.gif' on all other platforms.
     */
    warningImage: Image;
    /**
     * Specifies the resource key for the error message to be displayed in
     * non-multigraphs when two vertices are already connected. If the resource
     * for this key does not exist then the value is used as the error message.
     * @default 'alreadyConnected'
     */
    alreadyConnectedResource: string;
    /**
     * Specifies the resource key for the warning message to be displayed when
     * a collapsed cell contains validation errors. If the resource for this
     * key does not exist then the value is used as the warning message.
     * @default 'containsValidationErrors'
     */
    containsValidationErrorsResource: string;
    /**
     * Creates a new {@link CellRenderer} to be used in this graph.
     */
    createCellRenderer(): CellRenderer;
    /**
     * Hooks to create a new {@link EdgeHandler} for the given {@link CellState}.
     *
     * @param state {@link CellState} to create the handler for.
     */
    createEdgeHandlerInstance(state: CellState): EdgeHandler;
    /**
     * Hooks to create a new {@link EdgeSegmentHandler} for the given {@link CellState}.
     *
     * @param state {@link CellState} to create the handler for.
     */
    createEdgeSegmentHandler(state: CellState): EdgeSegmentHandler;
    /**
     * Hooks to create a new {@link ElbowEdgeHandler} for the given {@link CellState}.
     *
     * @param state {@link CellState} to create the handler for.
     */
    createElbowEdgeHandler(state: CellState): ElbowEdgeHandler;
    /**
     * Creates a new {@link GraphDataModel} to be used in this graph.
     */
    createGraphDataModel(): GraphDataModel;
    /**
     * Creates a new {@link GraphView} to be used in this graph.
     */
    createGraphView(): GraphView;
    /**
     * Creates a new {@link GraphSelectionModel} to be used in this graph.
     */
    createSelectionModel(): GraphSelectionModel;
    /**
     * Creates a new {@link Stylesheet} to be used in this graph.
     */
    createStylesheet(): Stylesheet;
    /**
     * Hooks to create a new {@link VertexHandler} for the given {@link CellState}.
     *
     * @param state {@link CellState} to create the handler for.
     */
    createVertexHandler(state: CellState): VertexHandler;
    protected registerDefaults(): void;
    constructor(container: HTMLElement, model?: GraphDataModel, plugins?: GraphPluginConstructor[], stylesheet?: Stylesheet | null);
    getContainer: () => HTMLElement;
    getPlugin: (id: string) => unknown;
    getCellRenderer: () => CellRenderer;
    getDialect: () => "svg" | "mixedHtml" | "preferHtml" | "strictHtml";
    isPageVisible: () => boolean;
    isPageBreaksVisible: () => boolean;
    getPageBreakColor: () => string;
    isPageBreakDashed: () => boolean;
    getMinPageBreakDist: () => number;
    isPreferPageSize: () => boolean;
    getPageFormat: () => Rectangle;
    getPageScale: () => number;
    isExportEnabled: () => boolean;
    isImportEnabled: () => boolean;
    isIgnoreScrollbars: () => boolean;
    isTranslateToScrollPosition: () => boolean;
    getMinimumGraphSize: () => Rectangle | null;
    setMinimumGraphSize: (size: Rectangle | null) => Rectangle | null;
    getMinimumContainerSize: () => Rectangle | null;
    setMinimumContainerSize: (size: Rectangle | null) => Rectangle | null;
    getWarningImage(): Image;
    getAlreadyConnectedResource: () => string;
    getContainsValidationErrorsResource: () => string;
    /**
     * Updates the model in a transaction.
     *
     * @param fn the update to be performed in the transaction.
     *
     * @see {@link GraphDataModel.batchUpdate}
     */
    batchUpdate(fn: () => void): void;
    /**
     * Returns the {@link GraphDataModel} that contains the cells.
     */
    getDataModel(): GraphDataModel;
    /**
     * Returns the {@link GraphView} that contains the {@link mxCellStates}.
     */
    getView(): GraphView;
    /**
     * Returns the {@link Stylesheet} that defines the style.
     */
    getStylesheet(): Stylesheet;
    /**
     * Sets the {@link Stylesheet} that defines the style.
     */
    setStylesheet(stylesheet: Stylesheet): void;
    /**
     * Called when the graph model changes. Invokes {@link processChange} on each
     * item of the given array to update the view accordingly.
     *
     * @param changes Array that contains the individual changes.
     */
    graphModelChanged(changes: any[]): void;
    /**
     * Processes the given change and invalidates the respective cached data
     * in {@link GraphView}. This fires a {@link root} event if the root has changed in the
     * model.
     *
     * @param {(RootChange|ChildChange|TerminalChange|GeometryChange|ValueChange|StyleChange)} change - Object that represents the change on the model.
     */
    processChange(change: any): void;
    /**
     * Scrolls the graph to the given point, extending the graph container if
     * specified.
     */
    scrollPointToVisible(x: number, y: number, extend?: boolean, border?: number): void;
    /**
     * Returns the size of the border and padding on all four sides of the
     * container. The left, top, right and bottom borders are stored in the x, y,
     * width and height of the returned {@link Rectangle}, respectively.
     */
    getBorderSizes(): Rectangle;
    /**
     * Returns the preferred size of the background page if {@link preferPageSize} is true.
     */
    getPreferredPageSize(bounds: Rectangle, width: number, height: number): Rectangle;
    /**
     * Scales the graph such that the complete diagram fits into <container> and
     * returns the current scale in the view. To fit an initial graph prior to
     * rendering, set {@link GraphView#rendering} to false prior to changing the model
     * and execute the following after changing the model.
     *
     * ```javascript
     * graph.fit();
     * graph.view.rendering = true;
     * graph.refresh();
     * ```
     *
     * To fit and center the graph, the following code can be used.
     *
     * ```javascript
     * let margin = 2;
     * let max = 3;
     *
     * let bounds = graph.getGraphBounds();
     * let cw = graph.container.clientWidth - margin;
     * let ch = graph.container.clientHeight - margin;
     * let w = bounds.width / graph.view.scale;
     * let h = bounds.height / graph.view.scale;
     * let s = Math.min(max, Math.min(cw / w, ch / h));
     *
     * graph.view.scaleAndTranslate(s,
     *   (margin + cw - w * s) / (2 * s) - bounds.x / graph.view.scale,
     *   (margin + ch - h * s) / (2 * s) - bounds.y / graph.view.scale);
     * ```
     *
     * @param border Optional number that specifies the border. Default is <border>.
     * @param keepOrigin Optional boolean that specifies if the translate should be
     * changed. Default is false.
     * @param margin Optional margin in pixels. Default is 0.
     * @param enabled Optional boolean that specifies if the scale should be set or
     * just returned. Default is true.
     * @param ignoreWidth Optional boolean that specifies if the width should be
     * ignored. Default is false.
     * @param ignoreHeight Optional boolean that specifies if the height should be
     * ignored. Default is false.
     * @param maxHeight Optional maximum height.
     */
    fit(border?: number, keepOrigin?: boolean, margin?: number, enabled?: boolean, ignoreWidth?: boolean, ignoreHeight?: boolean, maxHeight?: number | null): number;
    /**
     * Resizes the container for the given graph width and height.
     */
    doResizeContainer(width: number, height: number): void;
    /*****************************************************************************
     * Group: UNCLASSIFIED
     *****************************************************************************/
    /**
     * Creates a new handler for the given cell state. This implementation
     * returns a new {@link EdgeHandler} of the corresponding cell is an edge,
     * otherwise it returns an {@link VertexHandler}.
     *
     * @param state {@link CellState} whose handler should be created.
     */
    createHandler(state: CellState): EdgeHandler | VertexHandler;
    /**
     * Hooks to create a new {@link EdgeHandler} for the given {@link CellState}.
     *
     * @param state {@link CellState} to create the handler for.
     * @param edgeStyle the {@link EdgeStyleFunction} that let choose the actual edge handler.
     */
    createEdgeHandler(state: CellState, edgeStyle: EdgeStyleFunction | null): EdgeHandler;
    /*****************************************************************************
     * Group: Drilldown
     *****************************************************************************/
    /**
     * Returns the current root of the displayed cell hierarchy. This is a
     * shortcut to {@link GraphView.currentRoot} in {@link GraphView}.
     */
    getCurrentRoot(): Cell | null;
    /**
     * Returns the translation to be used if the given cell is the root cell as
     * an {@link Point}. This implementation returns null.
     *
     * To keep the children at their absolute position while stepping into groups,
     * this function can be overridden as follows.
     *
     * @example
     * ```javascript
     * var offset = new mxPoint(0, 0);
     *
     * while (cell != null)
     * {
     *   var geo = this.model.getGeometry(cell);
     *
     *   if (geo != null)
     *   {
     *     offset.x -= geo.x;
     *     offset.y -= geo.y;
     *   }
     *
     *   cell = this.model.getParent(cell);
     * }
     *
     * return offset;
     * ```
     *
     * @param cell {@link mxCell} that represents the root.
     */
    getTranslateForRoot(cell: Cell | null): Point | null;
    /**
     * Returns the offset to be used for the cells inside the given cell. The
     * root and layer cells may be identified using {@link GraphDataModel.isRoot} and
     * {@link GraphDataModel.isLayer}. For all other current roots, the
     * {@link GraphView.currentRoot} field points to the respective cell, so that
     * the following holds: cell == this.view.currentRoot. This implementation
     * returns null.
     *
     * @param cell {@link mxCell} whose offset should be returned.
     */
    getChildOffsetForCell(cell: Cell): Point | null;
    /**
     * Uses the root of the model as the root of the displayed cell hierarchy
     * and selects the previous root.
     */
    home(): void;
    /**
     * Returns true if the given cell is a valid root for the cell display
     * hierarchy. This implementation returns true for all non-null values.
     *
     * @param cell {@link mxCell} which should be checked as a possible root.
     */
    isValidRoot(cell: Cell): boolean;
    /*****************************************************************************
     * Group: Graph display
     *****************************************************************************/
    /**
     * Returns the bounds of the visible graph. Shortcut to
     * {@link GraphView.getGraphBounds}. See also: {@link getBoundingBoxFromGeometry}.
     */
    getGraphBounds(): Rectangle;
    /**
     * Returns the bounds inside which the diagram should be kept as an
     * {@link Rectangle}.
     */
    getMaximumGraphBounds(): Rectangle | null;
    /**
     * Clears all cell states or the states for the hierarchy starting at the
     * given cell and validates the graph. This fires a refresh event as the
     * last step.
     *
     * @param cell Optional {@link Cell} for which the cell states should be cleared.
     */
    refresh(cell?: Cell | null): void;
    /**
     * Centers the graph in the container.
     *
     * @param horizontal Optional boolean that specifies if the graph should be centered
     * horizontally. Default is `true`.
     * @param vertical Optional boolean that specifies if the graph should be centered
     * vertically. Default is `true`.
     * @param cx Optional float that specifies the horizontal center. Default is `0.5`.
     * @param cy Optional float that specifies the vertical center. Default is `0.5`.
     */
    center(horizontal?: boolean, vertical?: boolean, cx?: number, cy?: number): void;
    /**
     * Returns true if perimeter points should be computed such that the
     * resulting edge has only horizontal or vertical segments.
     *
     * @param edge {@link CellState} that represents the edge.
     */
    isOrthogonal(edge: CellState): boolean;
    /*****************************************************************************
     * Group: Graph appearance
     *****************************************************************************/
    /**
     * Returns the {@link backgroundImage} as an {@link Image}.
     */
    getBackgroundImage(): Image | null;
    /**
     * Sets the new {@link backgroundImage}.
     *
     * @param image New {@link Image} to be used for the background.
     */
    setBackgroundImage(image: Image | null): void;
    /**
     * Returns the textual representation for the given cell. This
     * implementation returns the nodename or string-representation of the user
     * object.
     *
     *
     * The following returns the label attribute from the cells user
     * object if it is an XML node.
     *
     * @example
     * ```javascript
     * graph.convertValueToString = function(cell)
     * {
     * 	return cell.getAttribute('label');
     * }
     * ```
     *
     * See also: {@link cellLabelChanged}.
     *
     * @param cell {@link mxCell} whose textual representation should be returned.
     */
    convertValueToString(cell: Cell): string;
    /**
     * Returns the string to be used as the link for the given cell. This
     * implementation returns null.
     *
     * @param cell {@link mxCell} whose tooltip should be returned.
     */
    getLinkForCell(cell: Cell): string | null;
    /**
     * Returns the value of {@link border}.
     */
    getBorder(): number;
    /**
     * Sets the value of {@link border}.
     *
     * @param value Positive integer that represents the border to be used.
     */
    setBorder(value: number): void;
    /*****************************************************************************
     * Group: Graph behaviour
     *****************************************************************************/
    /**
     * Returns {@link resizeContainer}.
     */
    isResizeContainer(): boolean;
    /**
     * Sets {@link resizeContainer}.
     *
     * @param value Boolean indicating if the container should be resized.
     */
    setResizeContainer(value: boolean): void;
    /**
     * Returns true if the graph is {@link enabled}.
     */
    isEnabled(): boolean;
    /**
     * Specifies if the graph should allow any interactions. This
     * implementation updates {@link enabled}.
     *
     * @param value Boolean indicating if the graph should be enabled.
     */
    setEnabled(value: boolean): void;
    /**
     * Returns {@link multigraph} as a boolean.
     */
    isMultigraph(): boolean;
    /**
     * Specifies if the graph should allow multiple connections between the
     * same pair of vertices.
     *
     * @param value Boolean indicating if the graph allows multiple connections
     * between the same pair of vertices.
     */
    setMultigraph(value: boolean): void;
    /**
     * Returns {@link allowLoops} as a boolean.
     */
    isAllowLoops(): boolean;
    /**
     * Specifies if loops are allowed.
     *
     * @param value Boolean indicating if loops are allowed.
     */
    setAllowLoops(value: boolean): void;
    /**
     * Returns {@link recursiveResize}.
     *
     * @param state {@link CellState} that is being resized.
     */
    isRecursiveResize(state?: CellState | null): boolean;
    /**
     * Sets {@link recursiveResize}.
     *
     * @param value New boolean value for {@link recursiveResize}.
     */
    setRecursiveResize(value: boolean): void;
    /**
     * Returns a decimal number representing the amount of the width and height
     * of the given cell that is allowed to overlap its parent. A value of 0
     * means all children must stay inside the parent, 1 means the child is
     * allowed to be placed outside of the parent such that it touches one of
     * the parents sides. If {@link isAllowOverlapParent} returns false for the given
     * cell, then this method returns 0.
     *
     * @param cell {@link mxCell} for which the overlap ratio should be returned.
     */
    getOverlap(cell: Cell): number;
    /**
     * Returns true if the given cell is allowed to be placed outside of the
     * parents area.
     *
     * @param cell {@link mxCell} that represents the child to be checked.
     */
    isAllowOverlapParent(cell: Cell): boolean;
    /*****************************************************************************
     * Group: Cell retrieval
     *****************************************************************************/
    /**
     * Returns {@link defaultParent} or {@link GraphView.currentRoot} or the first child
     * child of {@link GraphDataModel.root} if both are null. The value returned by
     * this function should be used as the parent for new cells (aka default
     * layer).
     */
    getDefaultParent(): Cell;
    /**
     * Sets the {@link defaultParent} to the given cell. Set this to null to return
     * the first child of the root in getDefaultParent.
     */
    setDefaultParent(cell: Cell | null): void;
    /**
     * Destroys the graph and all its resources.
     */
    destroy(): void;
}
/**
 * Codec for {@link Graph}s. This class is created and registered
 * dynamically at load time and used implicitly via <Codec>
 * and the <CodecRegistry>.
 *
 * Transient Fields:
 *
 * - graphListeners
 * - eventListeners
 * - view
 * - container
 * - cellRenderer
 * - editor
 * - selection
 */
export { Graph };
