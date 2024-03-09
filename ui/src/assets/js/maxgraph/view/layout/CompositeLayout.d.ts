import Cell from '../cell/Cell';
import { Graph } from '../Graph';
import GraphLayout from './GraphLayout';
/**
 * Allows to compose multiple layouts into a single layout.
 *
 * The {@link master} layout is the layout that handles move operations if another layout than the first
 * element in {@link GraphLayout}s should be used. The {@link master} layout is not executed as
 * the code assumes that it is part of {@link layouts}.
 *
 * Example:
 * ```javascript
 * const first = new FastOrganicLayout(graph);
 * const second = new ParallelEdgeLayout(graph);
 * const layout = new CompositeLayout(graph, [first, second], first);
 * layout.execute(graph.getDefaultParent());
 * ```
 *
 * Constructs a new layout using the given layouts. The graph instance is
 * required for creating the transaction that contains all layouts.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing {@link Graph}.
 * layouts - Array of {@link GraphLayout}s.
 * master - Optional layout that handles moves. If no layout is given then
 * the first layout of the above array is used to handle moves.
 */
declare class CompositeLayout extends GraphLayout {
    /**
     * Constructs a new layout using the given layouts. The graph instance is
     * required for creating the transaction that contains all layouts.
     *
     * @param graph Reference to the enclosing {@link Graph}.
     * @param layouts Array of {@link GraphLayout}s.
     * @param master Optional layout that handles moves. If no layout is given, then the first layout of the above array is used to handle moves.
     */
    constructor(graph: Graph, layouts: GraphLayout[], master?: GraphLayout);
    /**
     * Holds the array of {@link GraphLayout}s that this layout contains.
     */
    layouts: GraphLayout[];
    /**
     * Reference to the {@link GraphLayout}s that handles moves. If this is null
     * then the first layout in <layouts> is used.
     */
    master?: GraphLayout;
    /**
     * Calls `move` on {@link master} or the first layout in {@link layouts}.
     */
    moveCell(cell: Cell, x: number, y: number): void;
    /**
     * Implements {@link GraphLayout#execute} by executing all {@link layouts} in a single transaction.
     */
    execute(parent: Cell): void;
}
export default CompositeLayout;
