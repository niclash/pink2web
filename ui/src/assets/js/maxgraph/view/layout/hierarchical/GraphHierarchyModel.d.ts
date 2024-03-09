import Dictionary from '../../../util/Dictionary';
import GraphHierarchyNode from '../datatypes/GraphHierarchyNode';
import GraphHierarchyEdge from '../datatypes/GraphHierarchyEdge';
import Cell from '../../cell/Cell';
import HierarchicalLayout from '../HierarchicalLayout';
import GraphAbstractHierarchyCell from '../datatypes/GraphAbstractHierarchyCell';
/**
 * Internal model of a hierarchical graph. This model stores nodes and edges
 * equivalent to the real graph nodes and edges, but also stores the rank of the
 * cells, the order within the ranks and the new candidate locations of cells.
 * The internal model also reverses edge direction were appropriate , ignores
 * self-loop and groups parallels together under one edge object.
 *
 * Constructor: mxGraphHierarchyModel
 *
 * Creates an internal ordered graph model using the vertices passed in. If
 * there are any, leftward edge need to be inverted in the internal model
 *
 * Arguments:
 *
 * graph - the facade describing the graph to be operated on
 * vertices - the vertices for this hierarchy
 * ordered - whether or not the vertices are already ordered
 * deterministic - whether or not this layout should be deterministic on each
 * tightenToSource - whether or not to tighten vertices towards the sources
 * scanRanksFromSinks - Whether rank assignment is from the sinks or sources.
 * usage
 */
declare class GraphHierarchyModel {
    constructor(layout: HierarchicalLayout, vertices: Cell[], roots: Cell[], parent: Cell, tightenToSource: boolean);
    /**
     * Stores the largest rank number allocated
     */
    maxRank: number;
    /**
     * Map from graph vertices to internal model nodes.
     */
    vertexMapper: Dictionary<Cell, GraphHierarchyNode>;
    /**
     * Map from graph edges to internal model edges
     */
    edgeMapper: Dictionary<Cell, GraphHierarchyEdge>;
    /**
     * Mapping from rank number to actual rank
     */
    ranks: GraphAbstractHierarchyCell[][] | null;
    /**
     * Store of roots of this hierarchy model, these are real graph cells, not
     * internal cells
     */
    roots: Cell[] | null;
    /**
     * The parent cell whose children are being laid out
     */
    parent: Cell | null;
    /**
     * Count of the number of times the ancestor dfs has been used.
     */
    dfsCount: number;
    /**
     * High value to start source layering scan rank value from.
     */
    SOURCESCANSTARTRANK: number;
    /**
     * Whether or not to tighten the assigned ranks of vertices up towards
     * the source cells.
     */
    tightenToSource: boolean;
    /**
     * Creates all edges in the internal model
     *
     * @param layout Reference to the <HierarchicalLayout> algorithm.
     * @param vertices Array of {@link Cells} that represent the vertices whom are to
     * have an internal representation created.
     * @param internalVertices The array of {@link GraphHierarchyNodes} to have their
     * information filled in using the real vertices.
     */
    createInternalCells(layout: HierarchicalLayout, vertices: Cell[], internalVertices: {
        [key: number]: GraphHierarchyNode;
    }): void;
    /**
     * Basic determination of minimum layer ranking by working from from sources
     * or sinks and working through each node in the relevant edge direction.
     * Starting at the sinks is basically a longest path layering algorithm.
     */
    initialRank(): void;
    /**
     * Fixes the layer assignments to the values stored in the nodes. Also needs
     * to create dummy nodes for edges that cross layers.
     */
    fixRanks(): void;
    /**
     * A depth first search through the internal heirarchy model.
     *
     * @param visitor The visitor function pattern to be called for each node.
     * @param trackAncestors Whether or not the search is to keep track all nodes
     * directly above this one in the search path.
     */
    visit(visitor: Function, dfsRoots: GraphHierarchyNode[] | null, trackAncestors: boolean, seenNodes?: {
        [key: string]: GraphHierarchyNode;
    } | null): void;
    /**
     * Performs a depth first search on the internal hierarchy model
     *
     * @param parent the parent internal node of the current internal node
     * @param root the current internal node
     * @param connectingEdge the internal edge connecting the internal node and the parent
     * internal node, if any
     * @param visitor the visitor pattern to be called for each node
     * @param seen a set of all nodes seen by this dfs a set of all of the
     * ancestor node of the current node
     * @param layer the layer on the dfs tree ( not the same as the model ranks )
     */
    dfs(parent: GraphHierarchyNode | null, root: GraphHierarchyNode | null, connectingEdge: GraphHierarchyEdge | null, visitor: Function, seen: {
        [key: string]: GraphHierarchyNode | null;
    }, layer: number): void;
    /**
     * Performs a depth first search on the internal hierarchy model. This dfs
     * extends the default version by keeping track of cells ancestors, but it
     * should be only used when necessary because of it can be computationally
     * intensive for deep searches.
     *
     * @param parent the parent internal node of the current internal node
     * @param root the current internal node
     * @param connectingEdge the internal edge connecting the internal node and the parent
     * internal node, if any
     * @param visitor the visitor pattern to be called for each node
     * @param seen a set of all nodes seen by this dfs
     * @param ancestors the parent hash code
     * @param childHash the new hash code for this node
     * @param layer the layer on the dfs tree ( not the same as the model ranks )
     */
    extendedDfs(parent: GraphHierarchyNode | null, root: GraphHierarchyNode, connectingEdge: GraphHierarchyEdge | null, visitor: Function, seen: {
        [key: string]: GraphHierarchyNode;
    }, ancestors: any, childHash: string | number, layer: number): void;
}
export default GraphHierarchyModel;
