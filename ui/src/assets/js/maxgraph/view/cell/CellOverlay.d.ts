import Point from '../geometry/Point';
import Rectangle from '../geometry/Rectangle';
import EventSource from '../event/EventSource';
import ImageBox from '../image/ImageBox';
import CellState from './CellState';
import ObjectIdentity from '../../util/ObjectIdentity';
import { AlignValue, VAlignValue } from '../../types';
/**
 * Extends {@link EventSource} to implement a graph overlay, represented by an icon
 * and a tooltip. Overlays can handle and fire <click> events and are added to
 * the graph using {@link Graph#addCellOverlay}, and removed using
 * {@link Graph#removeCellOverlay}, or {@link Graph#removeCellOverlays} to remove all overlays.
 * The {@link Graph#getCellOverlays} function returns the array of overlays for a given
 * cell in a graph. If multiple overlays exist for the same cell, then
 * <getBounds> should be overridden in at least one of the overlays.
 *
 * Overlays appear on top of all cells in a special layer. If this is not
 * desirable, then the image must be rendered as part of the shape or label of
 * the cell instead.
 *
 * Example:
 *
 * The following adds a new overlays for a given vertex and selects the cell
 * if the overlay is clicked.
 *
 * ```javascript
 * let overlay = new CellOverlay(img, html);
 * graph.addCellOverlay(vertex, overlay);
 * overlay.addListener(mxEvent.CLICK, (sender, evt)=>
 * {
 *   let cell = evt.getProperty('cell');
 *   graph.setSelectionCell(cell);
 * });
 * ```
 *
 * For cell overlays to be printed use {@link PrintPreview#printOverlays}.
 *
 * Event: mxEvent.CLICK
 *
 * Fires when the user clicks on the overlay. The <code>event</code> property
 * contains the corresponding mouse event and the <code>cell</code> property
 * contains the cell. For touch devices this is fired if the element receives
 * a touchend event.
 *
 * Constructor: CellOverlay
 *
 * Constructs a new overlay using the given image and tooltip.
 *
 * @param image {@link Image} that represents the icon to be displayed.
 * @param tooltip Optional string that specifies the tooltip.
 * @param align Optional horizontal alignment for the overlay. Possible
 * values are <ALIGN_LEFT>, <ALIGN_CENTER> and <ALIGN_RIGHT>
 * (default).
 * @param verticalAlign Vertical alignment for the overlay. Possible
 * values are <ALIGN_TOP>, <ALIGN_MIDDLE> and <ALIGN_BOTTOM>
 * (default).
 */
declare class CellOverlay extends EventSource implements ObjectIdentity {
    constructor(image: ImageBox, tooltip?: string | null, align?: AlignValue, verticalAlign?: VAlignValue, offset?: Point, cursor?: string);
    /**
     * Holds the {@link Image} to be used as the icon.
     */
    image: ImageBox;
    /**
     * Holds the optional string to be used as the tooltip.
     */
    tooltip?: string | null;
    /**
     * Holds the horizontal alignment for the overlay.
     *
     * For edges, the overlay always appears in the center of the edge.
     * @default 'right'
     */
    align: AlignValue;
    /**
     * Holds the vertical alignment for the overlay.
     *
     * For edges, the overlay always appears in the center of the edge.
     * @default 'bottom'
     */
    verticalAlign: VAlignValue;
    /**
     * Holds the offset as an {@link Point}. The offset will be scaled according to the
     * current scale.
     */
    offset: Point;
    /**
     * Holds the cursor for the overlay.
     * @default 'help'.
     */
    cursor: string;
    /**
     * Defines the overlapping for the overlay, that is, the proportional distance
     * from the origin to the point defined by the alignment. Default is 0.5.
     */
    defaultOverlap: number;
    /**
     * Returns the bounds of the overlay for the given <CellState> as an
     * {@link Rectangle}. This should be overridden when using multiple overlays
     * per cell so that the overlays do not overlap.
     *
     * The following example will place the overlay along an edge (where
     * x=[-1..1] from the start to the end of the edge and y is the
     * orthogonal offset in px).
     *
     * ```javascript
     * overlay.getBounds = function(state)
     * {
     *   var bounds = getBounds.apply(this, arguments);
     *
     *   if (state.view.graph.getDataModel().isEdge(state.cell))
     *   {
     *     var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
     *
     *     bounds.x = pt.x - bounds.width / 2;
     *     bounds.y = pt.y - bounds.height / 2;
     *   }
     *
     *   return bounds;
     * };
     * ```
     *
     * @param state <CellState> that represents the current state of the
     * associated cell.
     */
    getBounds(state: CellState): Rectangle;
    /**
     * Returns the textual representation of the overlay to be used as the
     * tooltip. This implementation returns <tooltip>.
     */
    toString(): string | null | undefined;
}
export default CellOverlay;
