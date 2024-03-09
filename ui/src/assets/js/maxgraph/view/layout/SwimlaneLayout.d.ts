import GraphLayout from './GraphLayout';
import { DIRECTION } from '../../util/Constants';
import Dictionary from '../../util/Dictionary';
import SwimlaneModel from './hierarchical/SwimlaneModel';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
import { SwimlaneGraphLayoutTraverseArgs } from './types';
/**
 * A hierarchical layout algorithm.
 *
 * Constructor: mxSwimlaneLayout
 *
 * Constructs a new hierarchical layout algorithm.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing {@link Graph}.
 * orientation - Optional constant that defines the orientation of this
 * layout.
 * deterministic - Optional boolean that specifies if this layout should be
 * deterministic. Default is true.
 */
declare class SwimlaneLayout extends GraphLayout {
    constructor(graph: Graph, orientation: DIRECTION | null, deterministic?: boolean);
    parentX: number | null;
    parentY: number | null;
    deterministic: boolean;
    /**
     * Holds the array of <Cell> that this layout contains.
     */
    roots: Cell[] | null;
    /**
     * Holds the array of <Cell> of the ordered swimlanes to lay out
     */
    swimlanes: Cell[] | null;
    /**
     * The cell width of any dummy vertices inserted
     */
    dummyVertexWidth: number;
    /**
     * Specifies if the parent should be resized after the layout so that it
     * contains all the child cells. Default is false. See also <parentBorder>.
     */
    resizeParent: boolean;
    /**
     * Specifies if the parent location should be maintained, so that the
     * top, left corner stays the same before and after execution of
     * the layout. Default is false for backwards compatibility.
     */
    maintainParentLocation: boolean;
    /**
     * Specifies if the parent should be moved if <resizeParent> is enabled.
     * Default is false.
     */
    moveParent: boolean;
    /**
     * The border to be added around the children if the parent is to be
     * resized using <resizeParent>. Default is 30.
     */
    parentBorder: number;
    /**
     * The spacing buffer added between cells on the same layer. Default is 30.
     */
    intraCellSpacing: number;
    /**
     * The spacing buffer added between cell on adjacent layers. Default is 100.
     */
    interRankCellSpacing: number;
    /**
     * The spacing buffer between unconnected hierarchies. Default is 60.
     */
    interHierarchySpacing: number;
    /**
     * The distance between each parallel edge on each ranks for long edges.
     * Default is 10.
     */
    parallelEdgeSpacing: number;
    /**
     * The position of the root node(s) relative to the laid out graph in.
     * Default is {@link Constants#DIRECTION_NORTH}.
     */
    orientation: DIRECTION;
    /**
     * Whether or not to perform local optimisations and iterate multiple times
     * through the algorithm. Default is true.
     */
    fineTuning: boolean;
    /**
     * Whether or not to tighten the assigned ranks of vertices up towards
     * the source cells. Default is true.
     */
    tightenToSource: boolean;
    /**
     * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
     * modified by the result. Default is true.
     */
    disableEdgeStyle: boolean;
    /**
     * Whether or not to drill into child cells and layout in reverse
     * group order. This also cause the layout to navigate edges whose
     * terminal vertices have different parents but are in the same
     * ancestry chain. Default is true.
     */
    traverseAncestors: boolean;
    /**
     * The internal {@link SwimlaneModel} formed of the layout.
     */
    model: SwimlaneModel | null;
    /**
     * A cache of edges whose source terminal is the key
     */
    edgesCache: Dictionary<Cell, Cell[]>;
    /**
     * A cache of edges whose source terminal is the key
     */
    edgeSourceTermCache: Dictionary<Cell, Cell>;
    /**
     * A cache of edges whose source terminal is the key
     */
    edgesTargetTermCache: Dictionary<Cell, Cell>;
    /**
     * The style to apply between cell layers to edge segments.
     * Default is {@link HierarchicalEdgeStyle#POLYLINE}.
     */
    edgeStyle: number;
    /**
     * Returns the internal {@link SwimlaneModel} for this layout algorithm.
     */
    getDataModel(): SwimlaneModel | null;
    /**
     * Executes the layout for the children of the specified parent.
     *
     * @param parent Parent <Cell> that contains the children to be laid out.
     * @param swimlanes Ordered array of swimlanes to be laid out
     */
    execute(parent: Cell, swimlanes?: Cell[] | null): void;
    /**
     * Updates the bounds of the given array of groups so that it includes
     * all child vertices.
     *
     */
    updateGroupBounds(): void;
    /**
     * Returns all visible children in the given parent which do not have
     * incoming edges. If the result is empty then the children with the
     * maximum difference between incoming and outgoing edges are returned.
     * This takes into account edges that are being promoted to the given
     * root due to invisible children or collapsed cells.
     *
     * @param parent <Cell> whose children should be checked.
     * @param vertices array of vertices to limit search to
     */
    findRoots(parent: Cell, vertices: {
        [key: string]: Cell;
    }): Cell[];
    /**
     * Returns the connected edges for the given cell.
     *
     * @param cell <Cell> whose edges should be returned.
     */
    getEdges(cell: Cell): Cell[];
    /**
     * Helper function to return visible terminal for edge allowing for ports
     *
     * @param edge <Cell> whose edges should be returned.
     * @param source Boolean that specifies whether the source or target terminal is to be returned
     */
    getVisibleTerminal(edge: Cell, source: boolean): Cell | null;
    /**
     * The API method used to exercise the layout upon the graph description
     * and produce a separate description of the vertex position and edge
     * routing changes made. It runs each stage of the layout that has been
     * created.
     */
    run(parent: Cell): void;
    /**
     * Creates an array of descendant cells
     */
    filterDescendants(cell: Cell, result: {
        [key: string]: Cell;
    }): void;
    /**
     * Returns true if the given cell is a "port", that is, when connecting to
     * it, its parent is the connecting vertex in terms of graph traversal
     *
     * @param cell <Cell> that represents the port.
     */
    isPort(cell: Cell): boolean;
    /**
     * Returns the edges between the given source and target. This takes into
     * account collapsed and invisible cells and ports.
     *
     * source -
     * target -
     * directed -
     */
    getEdgesBetween(source: Cell, target: Cell, directed?: boolean): Cell[];
    /**
     * Traverses the (directed) graph invoking the given function for each
     * visited vertex and edge. The function is invoked with the current vertex
     * and the incoming edge as a parameter. This implementation makes sure
     * each vertex is only visited once. The function may return false if the
     * traversal should stop at the given vertex.
     *
     * @param vertex <Cell> that represents the vertex where the traversal starts.
     * @param directed boolean indicating if edges should only be traversed
     * from source to target. Default is true.
     * @param edge Optional <Cell> that represents the incoming edge. This is
     * null for the first step of the traversal.
     * @param allVertices Array of cell paths for the visited cells.
     * @param swimlaneIndex the laid out order index of the swimlane vertex is contained in
     */
    traverse({ vertex, directed, allVertices, currentComp, hierarchyVertices, filledVertexSet, swimlaneIndex, }: SwimlaneGraphLayoutTraverseArgs): {
        [key: string]: Cell | null;
    };
    /**
     * Executes the cycle stage using mxMinimumCycleRemover.
     */
    cycleStage(parent: Cell): void;
    /**
     * Implements first stage of a Sugiyama layout.
     */
    layeringStage(): void;
    /**
     * Executes the crossing stage using mxMedianHybridCrossingReduction.
     */
    crossingStage(parent: Cell): void;
    /**
     * Executes the placement stage using mxCoordinateAssignment.
     */
    placementStage(initialX: number, parent: Cell): number;
}
export default SwimlaneLayout;
