import GraphAbstractHierarchyCell from './GraphAbstractHierarchyCell';
import Cell from '../../cell/Cell';
import GraphHierarchyNode from './GraphHierarchyNode';
declare class GraphHierarchyEdge extends GraphAbstractHierarchyCell {
    /**
     * The graph edge(s) this object represents. Parallel edges are all grouped
     * together within one hierarchy edge.
     */
    edges: Cell[];
    /**
     * The object identities of the wrapped cells
     */
    ids: string[];
    /**
     * The node this edge is sourced at
     */
    source: GraphHierarchyNode | null;
    /**
     * The node this edge targets
     */
    target: GraphHierarchyNode | null;
    /**
     * Whether or not the direction of this edge has been reversed
     * internally to create a DAG for the hierarchical layout
     */
    isReversed: boolean;
    /**
     * Class: mxGraphHierarchyEdge
     *
     * An abstraction of a hierarchical edge for the hierarchy layout
     *
     * Constructor: mxGraphHierarchyEdge
     *
     * Constructs a hierarchy edge
     *
     * Arguments:
     *
     * edges - a list of real graph edges this abstraction represents
     */
    constructor(edges: Cell[]);
    /**
     * Inverts the direction of this internal edge(s)
     */
    invert(): void;
    /**
     * Returns the cells this cell connects to on the next layer up
     */
    getNextLayerConnectedCells(layer: number): GraphAbstractHierarchyCell[];
    /**
     * Returns the cells this cell connects to on the next layer down
     */
    getPreviousLayerConnectedCells(layer: number): GraphAbstractHierarchyCell[];
    /**
     * Returns true.
     */
    isEdge(): boolean;
    /**
     * Gets the value of temp for the specified layer
     */
    getGeneralPurposeVariable(layer: number): number;
    /**
     * Set the value of temp for the specified layer
     */
    setGeneralPurposeVariable(layer: number, value: number): void;
    /**
     * Gets the first core edge associated with this wrapper
     */
    getCoreCell(): Cell | null;
}
export default GraphHierarchyEdge;
