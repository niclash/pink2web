import GraphAbstractHierarchyCell from './GraphAbstractHierarchyCell';
import Cell from '../../cell/Cell';
import GraphHierarchyEdge from './GraphHierarchyEdge';
/**
 * An abstraction of a hierarchical edge for the hierarchy layout
 *
 * Constructor: mxGraphHierarchyNode
 *
 * Constructs an internal node to represent the specified real graph cell
 *
 * Arguments:
 *
 * cell - the real graph cell this node represents
 */
declare class GraphHierarchyNode extends GraphAbstractHierarchyCell {
    constructor(cell: Cell);
    /**
     * The graph cell this object represents.
     */
    cell: Cell;
    /**
     * The object identities of the wrapped cells
     */
    ids: string[];
    /**
     * The object identity of the wrapped cell
     */
    id: string;
    /**
     * Collection of hierarchy edges that have this node as a target
     */
    connectsAsTarget: GraphHierarchyEdge[];
    /**
     * Collection of hierarchy edges that have this node as a source
     */
    connectsAsSource: GraphHierarchyEdge[];
    /**
     * Assigns a unique hashcode for each node. Used by the model dfs instead
     * of copying HashSets
     */
    hashCode: any;
    /**
     * Returns the integer value of the layer that this node resides in
     */
    getRankValue(layer: number): number;
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
    isVertex(): boolean;
    /**
     * Gets the value of temp for the specified layer
     */
    getGeneralPurposeVariable(layer: number): any;
    /**
     * Set the value of temp for the specified layer
     */
    setGeneralPurposeVariable(layer: number, value: number): void;
    isAncestor(otherNode: GraphHierarchyNode): boolean;
    /**
     * Gets the core vertex associated with this wrapper
     */
    getCoreCell(): Cell;
}
export default GraphHierarchyNode;
