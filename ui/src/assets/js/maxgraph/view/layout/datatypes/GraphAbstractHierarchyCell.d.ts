import Cell from '../../cell/Cell';
declare abstract class GraphAbstractHierarchyCell extends Cell {
    swimlaneIndex: number | null;
    /**
     * The maximum rank this cell occupies. Default is -1.
     */
    maxRank: number;
    /**
     * The minimum rank this cell occupies. Default is -1.
     */
    minRank: number;
    /**
     * The x position of this cell for each layer it occupies
     */
    x: number[];
    /**
     * The y position of this cell for each layer it occupies
     */
    y: number[];
    /**
     * The width of this cell. Default is 0.
     */
    width: number;
    /**
     * The height of this cell. Default is 0.
     */
    height: number;
    /**
     * A cached version of the cells this cell connects to on the next layer up
     */
    nextLayerConnectedCells: {
        [key: number]: GraphAbstractHierarchyCell[];
    } | null;
    /**
     * A cached version of the cells this cell connects to on the next layer down
     */
    previousLayerConnectedCells: {
        [key: number]: GraphAbstractHierarchyCell[];
    } | null;
    /**
     * Temporary variable for general use. Generally, try to avoid
     * carrying information between stages. Currently, the longest
     * path layering sets temp to the rank position in fixRanks()
     * and the crossing reduction uses this. This meant temp couldn't
     * be used for hashing the nodes in the model dfs and so hashCode
     * was created
     */
    temp: number[];
    /**
     * Class: mxGraphAbstractHierarchyCell
     *
     * An abstraction of an internal hierarchy node or edge
     *
     * Constructor: mxGraphAbstractHierarchyCell
     *
     * Constructs a new hierarchical layout algorithm.
     */
    constructor();
    /**
     * Returns the cells this cell connects to on the next layer up
     */
    abstract getNextLayerConnectedCells(layer: number): GraphAbstractHierarchyCell[] | null;
    /**
     * Returns the cells this cell connects to on the next layer down
     */
    abstract getPreviousLayerConnectedCells(layer: number): GraphAbstractHierarchyCell[] | null;
    /**
     * Returns whether or not this cell is an edge
     */
    isEdge(): boolean;
    /**
     * Returns whether or not this cell is a node
     */
    isVertex(): boolean;
    /**
     * Gets the value of temp for the specified layer
     */
    abstract getGeneralPurposeVariable(layer: number): number | null;
    /**
     * Set the value of temp for the specified layer
     */
    abstract setGeneralPurposeVariable(layer: number, value: number): void;
    /**
     * Set the value of x for the specified layer
     */
    setX(layer: number, value: number): void;
    /**
     * Gets the value of x on the specified layer
     */
    getX(layer: number): number;
    /**
     * Set the value of y for the specified layer
     */
    setY(layer: number, value: number): void;
}
export default GraphAbstractHierarchyCell;
