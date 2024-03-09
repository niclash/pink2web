import CellMarker from './CellMarker';
import InternalMouseEvent from '../event/InternalMouseEvent';
import { Graph } from '../Graph';
import Cell from './Cell';
import EventSource from '../event/EventSource';
import type { ColorValue } from '../../types';
/**
 * Event handler that highlights cells
 *
 * ```javascript
 * new mxCellTracker(graph, '#00FF00');
 * ```
 *
 * For detecting dragEnter, dragOver and dragLeave on cells, the following code can be used:
 * ```javascript
 * graph.addMouseListener(
 * {
 *   cell: null,
 *   mouseDown: function(sender, me) { },
 *   mouseMove: function(sender, me)
 *   {
 *     var tmp = me.getCell();
 *
 *     if (tmp != this.cell)
 *     {
 *       if (this.cell != null)
 *       {
 *         this.dragLeave(me.getEvent(), this.cell);
 *       }
 *
 *       this.cell = tmp;
 *
 *       if (this.cell != null)
 *       {
 *         this.dragEnter(me.getEvent(), this.cell);
 *       }
 *     }
 *
 *     if (this.cell != null)
 *     {
 *       this.dragOver(me.getEvent(), this.cell);
 *     }
 *   },
 *   mouseUp: function(sender, me) { },
 *   dragEnter: function(evt, cell)
 *   {
 *     MaxLog.debug('dragEnter', cell.value);
 *   },
 *   dragOver: function(evt, cell)
 *   {
 *     MaxLog.debug('dragOver', cell.value);
 *   },
 *   dragLeave: function(evt, cell)
 *   {
 *     MaxLog.debug('dragLeave', cell.value);
 *   }
 * });
 * ```
 */
declare class CellTracker extends CellMarker {
    constructor(graph: Graph, color: ColorValue, funct?: ((me: InternalMouseEvent) => Cell) | null);
    destroyed: boolean;
    /**
     * Ignores the event. The event is not consumed.
     */
    mouseDown(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by highlighting the cell under the mousepointer if it
     * is over the hotspot region of the cell.
     */
    mouseMove(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Handles the event by resetting the highlight.
     */
    mouseUp(sender: EventSource, me: InternalMouseEvent): void;
    /**
     * Destroys the object and all its resources and DOM nodes. This doesn't
     * normally need to be called. It is called automatically when the window
     * unloads.
     */
    destroy(): void;
}
export default CellTracker;
