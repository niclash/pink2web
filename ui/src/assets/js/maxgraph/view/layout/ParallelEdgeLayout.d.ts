import GraphLayout from './GraphLayout';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
/**
 * Extends {@link GraphLayout} for arranging parallel edges. This layout works
 * on edges for all pairs of vertices where there is more than one edge
 * connecting the latter.
 *
 * Example:
 *
 * ```javascript
 * let layout = new mxParallelEdgeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * ```
 *
 * To run the layout for the parallel edges of a changed edge only, the
 * following code can be used.
 *
 * ```javascript
 * let layout = new mxParallelEdgeLayout(graph);
 *
 * graph.addListener(mxEvent.CELL_CONNECTED, (sender, evt)=>
 * {
 *   let model = graph.getDataModel();
 *   let edge = evt.getProperty('edge');
 *   let src = model.getTerminal(edge, true);
 *   let trg = model.getTerminal(edge, false);
 *
 *   layout.isEdgeIgnored = (edge2)=>
 *   {
 *     var src2 = model.getTerminal(edge2, true);
 *     var trg2 = model.getTerminal(edge2, false);
 *
 *     return !(model.isEdge(edge2) && ((src == src2 && trg == trg2) || (src == trg2 && trg == src2)));
 *   };
 *
 *   layout.execute(graph.getDefaultParent());
 * });
 * ```
 *
 * Constructor: mxParallelEdgeLayout
 *
 * Constructs a new parallel edge layout for the specified graph.
 */
declare class ParallelEdgeLayout extends GraphLayout {
    constructor(graph: Graph);
    /**
     * Defines the spacing between the parallels. Default is 20.
     */
    spacing: number;
    /**
     * Specifies if only overlapping edges should be considered
     * parallel. Default is false.
     */
    checkOverlap: boolean;
    /**
     * Implements {@link GraphLayout#execute}.
     */
    execute(parent: Cell, cells?: Cell[] | null): void;
    /**
     * Finds the parallel edges in the given parent.
     */
    findParallels(parent: Cell, cells?: Cell[] | null): any;
    /**
     * Returns a unique ID for the given edge. The id is independent of the
     * edge direction and is built using the visible terminal of the given
     * edge.
     */
    getEdgeId(edge: Cell): string | null;
    /**
     * Lays out the parallel edges in the given array.
     */
    layout(parallels: Cell[]): void;
    /**
     * Routes the given edge via the given point.
     */
    route(edge: Cell, x: number, y: number): void;
}
export default ParallelEdgeLayout;
