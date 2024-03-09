import GraphLayout from './GraphLayout';
import Rectangle from '../geometry/Rectangle';
import Cell from '../cell/Cell';
import { Graph } from '../Graph';
export interface _mxCompactTreeLayoutNode {
    cell?: Cell;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    offsetX?: number;
    offsetY?: number;
    contour?: {
        upperTail?: _mxCompactTreeLayoutLine;
        upperHead?: _mxCompactTreeLayoutLine;
        lowerTail?: _mxCompactTreeLayoutLine;
        lowerHead?: _mxCompactTreeLayoutLine;
        [key: string]: any;
    };
    next?: _mxCompactTreeLayoutNode;
    child?: _mxCompactTreeLayoutNode;
    theta?: number;
}
export interface _mxCompactTreeLayoutLine {
    dx: number;
    dy: number;
    next: _mxCompactTreeLayoutLine;
    child?: _mxCompactTreeLayoutLine;
}
/**
 * @class CompactTreeLayout
 * @extends {GraphLayout}
 *
 * Extends {@link GraphLayout} to implement a compact tree (Moen) algorithm. This
 * layout is suitable for graphs that have no cycles (trees). Vertices that are
 * not connected to the tree will be ignored by this layout.
 *
 * ### Example
 *
 * ```javascript
 * var layout = new mxCompactTreeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * ```
 */
export declare class CompactTreeLayout extends GraphLayout {
    constructor(graph: Graph, horizontal?: boolean, invert?: boolean);
    parentX: number | null;
    parentY: number | null;
    visited: {
        [key: string]: Cell;
    };
    /**
     * Specifies the orientation of the layout.
     * @default true
     */
    horizontal: boolean;
    /**
     * Specifies if edge directions should be inverted.
     * @default false.
     */
    invert: boolean;
    /**
     * If the parents should be resized to match the width/height of the
     * children. Default is true.
     * @default true
     */
    resizeParent: boolean;
    /**
     * Specifies if the parent location should be maintained, so that the
     * top, left corner stays the same before and after execution of
     * the layout. Default is false for backwards compatibility.
     * @default false
     */
    maintainParentLocation: boolean;
    /**
     * Padding added to resized parents.
     * @default 10
     */
    groupPadding: number;
    /**
     * Top padding added to resized parents.
     * @default 0
     */
    groupPaddingTop: number;
    /**
     * Right padding added to resized parents.
     * @default 0
     */
    groupPaddingRight: number;
    /**
     * Bottom padding added to resized parents.
     * @default 0
     */
    groupPaddingBottom: number;
    /**
     * Left padding added to resized parents.
     * @default 0
     */
    groupPaddingLeft: number;
    /**
     * A set of the parents that need updating based on children
     * process as part of the layout.
     */
    parentsChanged: {
        [id: string]: Cell;
    } | null;
    /**
     * Specifies if the tree should be moved to the top, left corner
     * if it is inside a top-level layer.
     * @default false
     */
    moveTree: boolean;
    /**
     * Holds the levelDistance.
     * @default 10
     */
    levelDistance: number;
    /**
     * Holds the nodeDistance.
     * @default 20
     */
    nodeDistance: number;
    /**
     * Specifies if all edge points of traversed edges should be removed.
     *
     * @default true
     */
    resetEdges: boolean;
    /**
     * The preferred horizontal distance between edges exiting a vertex.
     */
    prefHozEdgeSep: number;
    /**
     * The preferred vertical offset between edges exiting a vertex.
     */
    prefVertEdgeOff: number;
    /**
     * The minimum distance for an edge jetty from a vertex.
     */
    minEdgeJetty: number;
    /**
     * The size of the vertical buffer in the center of inter-rank channels
     * where edge control points should not be placed.
     */
    channelBuffer: number;
    /**
     * Whether or not to apply the internal tree edge routing.
     */
    edgeRouting: boolean;
    /**
     * Specifies if edges should be sorted according to the order of their
     * opposite terminal cell in the model.
     */
    sortEdges: boolean;
    /**
     * Whether or not the tops of cells in each rank should be aligned
     * across the rank
     */
    alignRanks: boolean;
    /**
     * An array of the maximum height of cells (relative to the layout direction)
     * per rank
     */
    maxRankHeight: Cell[];
    /**
     * The cell to use as the root of the tree
     */
    root: Cell | null;
    /**
     * The internal node representation of the root cell. Do not set directly
     * , this value is only exposed to assist with post-processing functionality
     */
    node: _mxCompactTreeLayoutNode | null;
    /**
     * Returns a boolean indicating if the given {@link mxCell} should be ignored as a
     * vertex. This returns true if the cell has no connections.
     *
     * @param vertex {@link mxCell} whose ignored state should be returned.
     */
    isVertexIgnored(vertex: Cell): boolean;
    /**
     * Returns {@link horizontal}.
     */
    isHorizontal(): boolean;
    /**
     * Implements {@link GraphLayout.execute}.
     *
     * If the parent has any connected edges, then it is used as the root of
     * the tree. Else, {@link mxGraph.findTreeRoots} will be used to find a suitable
     * root node within the set of children of the given parent.
     *
     * @param parent  {@link mxCell} whose children should be laid out.
     * @param root    Optional {@link mxCell} that will be used as the root of the tree. Overrides {@link root} if specified.
     */
    execute(parent: Cell, root?: Cell): void;
    /**
     * Moves the specified node and all of its children by the given amount.
     */
    moveNode(node: any, dx: number, dy: number): void;
    /**
     * Called if {@link sortEdges} is true to sort the array of outgoing edges in place.
     */
    sortOutgoingEdges(source: Cell, edges: Cell[]): void;
    /**
     * Stores the maximum height (relative to the layout
     * direction) of cells in each rank
     */
    findRankHeights(node: any, rank: number): void;
    /**
     * Set the cells heights (relative to the layout
     * direction) when the tops of each rank are to be aligned
     */
    setCellHeights(node: any, rank: number): void;
    /**
     * Does a depth first search starting at the specified cell.
     * Makes sure the specified parent is never left by the
     * algorithm.
     */
    dfs(cell: Cell, parent: Cell): _mxCompactTreeLayoutNode | null;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    layout(node: any): void;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    horizontalLayout(node: any, x0: number, y0: number, bounds?: Rectangle | null): Rectangle | null;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    verticalLayout(node: _mxCompactTreeLayoutNode, parent: _mxCompactTreeLayoutNode | null, x0: number, y0: number, bounds?: Rectangle | null): Rectangle | null;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    attachParent(node: any, height: number): void;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    layoutLeaf(node: any): void;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    join(node: any): number;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    merge(p1: any, p2: any): number;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    offset(p1: number, p2: number, a1: number, a2: number, b1: number, b2: number): number;
    bridge(line1: _mxCompactTreeLayoutLine, x1: number, y1: number, line2: _mxCompactTreeLayoutLine, x2: number, y2: number): _mxCompactTreeLayoutLine;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    createNode(cell: Cell): _mxCompactTreeLayoutNode;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    apply(node: _mxCompactTreeLayoutNode, bounds?: Rectangle | null): Rectangle | null;
    /**
     * Starts the actual compact tree layout algorithm
     * at the given node.
     */
    createLine(dx: number, dy: number, next?: any): _mxCompactTreeLayoutLine;
    /**
     * Adjust parent cells whose child geometries have changed. The default
     * implementation adjusts the group to just fit around the children with
     * a padding.
     */
    adjustParents(): void;
    /**
     * Moves the specified node and all of its children by the given amount.
     */
    localEdgeProcessing(node: _mxCompactTreeLayoutNode): void;
    /**
     * Separates the x position of edges as they connect to vertices
     */
    processNodeOutgoing(node: _mxCompactTreeLayoutNode): void;
}
export default CompactTreeLayout;
