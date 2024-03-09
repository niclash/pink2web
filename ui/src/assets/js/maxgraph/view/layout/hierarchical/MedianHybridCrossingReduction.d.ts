import HierarchicalLayout from '../HierarchicalLayout';
import GraphAbstractHierarchyCell from '../datatypes/GraphAbstractHierarchyCell';
import GraphHierarchyModel from './GraphHierarchyModel';
import HierarchicalLayoutStage from './HierarchicalLayoutStage';
import SwimlaneLayout from '../SwimlaneLayout';
/**
 * Sets the horizontal locations of node and edge dummy nodes on each layer.
 * Uses median down and up weighings as well heuristic to straighten edges as
 * far as possible.
 *
 * Constructor: mxMedianHybridCrossingReduction
 *
 * Creates a coordinate assignment.
 *
 * Arguments:
 *
 * intraCellSpacing - the minimum buffer between cells on the same rank
 * interRankCellSpacing - the minimum distance between cells on adjacent ranks
 * orientation - the position of the root node(s) relative to the graph
 * initialX - the leftmost coordinate node placement starts at
 */
declare class MedianHybridCrossingReduction extends HierarchicalLayoutStage {
    constructor(layout: HierarchicalLayout | SwimlaneLayout);
    /**
     * Reference to the enclosing <HierarchicalLayout>.
     */
    layout: HierarchicalLayout | SwimlaneLayout;
    /**
     * The maximum number of iterations to perform whilst reducing edge
     * crossings. Default is 24.
     */
    maxIterations: number;
    /**
     * Stores each rank as a collection of cells in the best order found for
     * each layer so far
     */
    nestedBestRanks: GraphAbstractHierarchyCell[][] | null;
    /**
     * The total number of crossings found in the best configuration so far
     */
    currentBestCrossings: number;
    /**
     * The total number of crossings found in the best configuration so far
     */
    iterationsWithoutImprovement: number;
    /**
     * The total number of crossings found in the best configuration so far
     */
    maxNoImprovementIterations: number;
    /**
     * Performs a vertex ordering within ranks as described by Gansner et al
     * 1993
     */
    execute(parent: any): void;
    /**
     * Calculates the total number of edge crossing in the current graph.
     * Returns the current number of edge crossings in the hierarchy graph
     * model in the current candidate layout
     *
     * @param model the internal model describing the hierarchy
     */
    calculateCrossings(model: GraphHierarchyModel): number;
    /**
     * Calculates the number of edges crossings between the specified rank and
     * the rank below it. Returns the number of edges crossings with the rank
     * beneath
     *
     * @param i  the topmost rank of the pair ( higher rank value )
     * @param model the internal model describing the hierarchy
     */
    calculateRankCrossing(i: number, model: GraphHierarchyModel): number;
    /**
     * Takes each possible adjacent cell pair on each rank and checks if
     * swapping them around reduces the number of crossing
     *
     * @param mainLoopIteration the iteration number of the main loop
     * @param model the internal model describing the hierarchy
     */
    transpose(mainLoopIteration: number, model: GraphHierarchyModel): void;
    /**
     * Sweeps up or down the layout attempting to minimise the median placement
     * of connected cells on adjacent ranks
     *
     * @param iteration the iteration number of the main loop
     * @param model the internal model describing the hierarchy
     */
    weightedMedian(iteration: number, model: GraphHierarchyModel): void;
    /**
     * Attempts to minimise the median placement of connected cells on this rank
     * and one of the adjacent ranks
     *
     * @param rankValue the layer number of this rank
     * @param downwardSweep whether or not this is a downward sweep through the graph
     */
    medianRank(rankValue: number, downwardSweep: boolean): void;
    /**
     * Calculates the median rank order positioning for the specified cell using
     * the connected cells on the specified rank. Returns the median rank
     * ordering value of the connected cells
     *
     * @param connectedCells the cells on the specified rank connected to the
     * specified cell
     * @param rankValue the rank that the connected cell lie upon
     */
    medianValue(connectedCells: GraphAbstractHierarchyCell[], rankValue: number): number;
}
export default MedianHybridCrossingReduction;
