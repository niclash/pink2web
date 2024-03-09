import GraphLayout from './GraphLayout';
import Cell from '../cell/Cell';
import { Graph } from '../Graph';
import CellState from '../cell/CellState';
/**
 * Extends {@link GraphLayout} to implement an edge label layout. This layout
 * makes use of cell states, which means the graph must be validated in
 * a graph view (so that the label bounds are available) before this layout
 * can be executed.
 *
 * ```javascript
 * var layout = new mxEdgeLabelLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * ```
 */
declare class EdgeLabelLayout extends GraphLayout {
    constructor(graph: Graph, radius: number);
    /**
     * Implements {@link GraphLayout.execute}
     */
    execute(parent: Cell): void;
    /**
     * Places the labels of the given edges.
     *
     * @param v   vertexes
     * @param e   edges
     */
    placeLabels(v: CellState[], e: CellState[]): void;
    /**
     * Places the labels of the given edges.
     */
    avoid(edge: CellState, vertex: CellState): void;
}
export default EdgeLabelLayout;
