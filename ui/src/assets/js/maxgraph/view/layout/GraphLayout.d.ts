import Rectangle from '../geometry/Rectangle';
import Point from '../geometry/Point';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
import { GraphLayoutTraverseArgs } from './types';
/**
 * Base class for all layout algorithms in mxGraph.
 *
 * Main public methods are {@link moveCell} for handling a moved cell within a layouted parent,
 * and {@link execute} for running the layout on a given parent cell.
 */
declare class GraphLayout {
    constructor(graph: Graph);
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Boolean indicating if the bounding box of the label should be used if it iss available.
     * @default true.
     */
    useBoundingBox: boolean;
    /**
     * The parent cell of the layout, if any
     * @default null
     */
    parent: Cell | null;
    /**
     * Notified when a cell is being moved in a parent that has automatic
     * layout to update the cell state (eg. index) so that the outcome of the
     * layout will position the vertex as close to the point (x, y) as
     * possible.
     *
     * Empty implementation.
     *
     * @param cell {@link Cell} which has been moved.
     * @param x X-coordinate of the new cell location.
     * @param y Y-coordinate of the new cell location.
     */
    moveCell(cell: Cell, x: number, y: number): void;
    /**
     * Notified when a cell is being resized in a parent that has automatic
     * layout to update the other cells in the layout.
     *
     * Empty implementation.
     *
     * @param cell {@link Cell} which has been moved.
     * @param bounds {@link Rectangle} that represents the new cell bounds.
     * @param prev
     */
    resizeCell(cell: Cell, bounds: Rectangle, prev?: Cell): void;
    /**
     * Executes the layout algorithm for the children of the given parent.
     *
     * @param parent {@link Cell} whose children should be layed out.
     */
    execute(parent: Cell): void;
    /**
     * Returns the graph that this layout operates on.
     */
    getGraph(): Graph;
    /**
     * Returns the constraint for the given key and cell. The optional edge and
     * source arguments are used to return inbound and outgoing routing-
     * constraints for the given edge and vertex. This implementation always
     * returns the value for the given key in the style of the given cell.
     *
     * @param key Key of the constraint to be returned.
     * @param cell {@link Cell} whose constraint should be returned.
     * @param edge Optional {@link Cell} that represents the connection whose constraint
     * should be returned. Default is null.
     * @param source Optional boolean that specifies if the connection is incoming
     * or outgoing. Default is null.
     */
    getConstraint(key: string, cell: Cell, edge?: Cell, source?: boolean): any;
    /**
     * Traverses the (directed) graph invoking the given function for each
     * visited vertex and edge. The function is invoked with the current vertex
     * and the incoming edge as a parameter. This implementation makes sure
     * each vertex is only visited once. The function may return false if the
     * traversal should stop at the given vertex.
     *
     * Example:
     *
     * ```javascript
     * MaxLog.show();
     * const cell = graph.getSelectionCell();
     * graph.traverse(cell, false, function(vertex, edge)
     * {
     *   MaxLog.debug(graph.getLabel(vertex));
     * });
     * ```
     *
     * @param vertex {@link Cell} that represents the vertex where the traversal starts.
     * @param directed Optional boolean indicating if edges should only be traversed
     * from source to target. Default is true.
     * @param func Visitor function that takes the current vertex and the incoming
     * edge as arguments. The traversal stops if the function returns false.
     * @param edge Optional {@link Cell} that represents the incoming edge. This is
     * null for the first step of the traversal.
     * @param visited Optional {@link Dictionary} of cell paths for the visited cells.
     */
    traverse({ vertex, directed, func, edge, visited }: GraphLayoutTraverseArgs): void;
    /**
     * Returns true if the given parent is an ancestor of the given child.
     *
     * @param parent {@link Cell} that specifies the parent.
     * @param child {@link Cell} that specifies the child.
     * @param traverseAncestors boolean whether to
     */
    isAncestor(parent: Cell, child: Cell | null, traverseAncestors?: boolean): boolean;
    /**
     * Returns a boolean indicating if the given {@link Cell} is movable or
     * bendable by the algorithm. This implementation returns true if the given
     * cell is movable in the graph.
     *
     * @param cell {@link Cell} whose movable state should be returned.
     */
    isVertexMovable(cell: Cell): boolean;
    /**
     * Returns a boolean indicating if the given {@link Cell} should be ignored by
     * the algorithm. This implementation returns false for all vertices.
     *
     * @param vertex {@link Cell} whose ignored state should be returned.
     */
    isVertexIgnored(vertex: Cell): boolean;
    /**
     * Returns a boolean indicating if the given {@link Cell} should be ignored by
     * the algorithm. This implementation returns false for all vertices.
     *
     * @param edge {@link Cell} whose ignored state should be returned.
     */
    isEdgeIgnored(edge: Cell): boolean;
    /**
     * Disables or enables the edge style of the given edge.
     */
    setEdgeStyleEnabled(edge: Cell, value: any): void;
    /**
     * Disables or enables orthogonal end segments of the given edge.
     */
    setOrthogonalEdge(edge: Cell, value: any): void;
    /**
     * Determines the offset of the given parent to the parent
     * of the layout
     */
    getParentOffset(parent: Cell | null): Point;
    /**
     * Replaces the array of Point in the geometry of the given edge
     * with the given array of Point.
     */
    setEdgePoints(edge: Cell, points: Point[] | null): void;
    /**
     * Sets the new position of the given cell taking into account the size of
     * the bounding box if {@link useBoundingBox} is true. The change is only carried
     * out if the new location is not equal to the existing location, otherwise
     * the geometry is not replaced with an updated instance. The new or old
     * bounds are returned (including overlapping labels).
     *
     * @param cell {@link Cell} whose geometry is to be set.
     * @param x Integer that defines the x-coordinate of the new location.
     * @param y Integer that defines the y-coordinate of the new location.
     */
    setVertexLocation(cell: Cell, x: number, y: number): Rectangle | null;
    /**
     * Returns an {@link Rectangle} that defines the bounds of the given cell or
     * the bounding box if {@link useBoundingBox} is true.
     */
    getVertexBounds(cell: Cell): Rectangle;
    /**
     * Shortcut to {@link Graph#updateGroupBounds} with moveGroup set to true.
     */
    arrangeGroups(cells: Cell[], border: number, topBorder: number, rightBorder: number, bottomBorder: number, leftBorder: number): Cell[];
}
export default GraphLayout;
