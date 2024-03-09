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
class CompositeLayout extends GraphLayout {
    /**
     * Constructs a new layout using the given layouts. The graph instance is
     * required for creating the transaction that contains all layouts.
     *
     * @param graph Reference to the enclosing {@link Graph}.
     * @param layouts Array of {@link GraphLayout}s.
     * @param master Optional layout that handles moves. If no layout is given, then the first layout of the above array is used to handle moves.
     */
    constructor(graph, layouts, master) {
        super(graph);
        this.layouts = layouts;
        this.master = master;
    }
    /**
     * Calls `move` on {@link master} or the first layout in {@link layouts}.
     */
    moveCell(cell, x, y) {
        if (this.master != null) {
            this.master.moveCell.apply(this.master, [cell, x, y]);
        }
        else {
            this.layouts[0].moveCell.apply(this.layouts[0], [cell, x, y]);
        }
    }
    /**
     * Implements {@link GraphLayout#execute} by executing all {@link layouts} in a single transaction.
     */
    execute(parent) {
        this.graph.batchUpdate(() => {
            for (let i = 0; i < this.layouts.length; i += 1) {
                this.layouts[i].execute.apply(this.layouts[i], [parent]);
            }
        });
    }
}
export default CompositeLayout;
