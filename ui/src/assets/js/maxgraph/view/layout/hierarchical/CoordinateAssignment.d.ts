import HierarchicalLayoutStage from './HierarchicalLayoutStage';
import { DIRECTION } from '../../../util/Constants';
import HierarchicalLayout from '../HierarchicalLayout';
import GraphHierarchyModel from './GraphHierarchyModel';
import Cell from '../../../view/cell/Cell';
import GraphHierarchyNode from '../datatypes/GraphHierarchyNode';
import GraphAbstractHierarchyCell from '../datatypes/GraphAbstractHierarchyCell';
import { Graph } from '../../../view/Graph';
import GraphHierarchyEdge from '../datatypes/GraphHierarchyEdge';
import SwimlaneLayout from '../SwimlaneLayout';
/**
 * Sets the horizontal locations of node and edge dummy nodes on each layer.
 * Uses median down and up weighings as well as heuristics to straighten edges as
 * far as possible.
 *
 * Constructor: mxCoordinateAssignment
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
declare class CoordinateAssignment extends HierarchicalLayoutStage {
    constructor(layout: HierarchicalLayout | SwimlaneLayout, intraCellSpacing: number | undefined, interRankCellSpacing: number | undefined, orientation: DIRECTION, initialX: number, parallelEdgeSpacing?: number);
    /**
     * Reference to the enclosing <HierarchicalLayout>.
     */
    layout: HierarchicalLayout | SwimlaneLayout;
    /**
     * The minimum buffer between cells on the same rank. Default is 30.
     */
    intraCellSpacing: number;
    /**
     * The minimum distance between cells on adjacent ranks. Default is 100.
     */
    interRankCellSpacing: number;
    /**
     * The distance between each parallel edge on each ranks for long edges.
     * Default is 10.
     */
    parallelEdgeSpacing: number;
    /**
     * The number of heuristic iterations to run. Default is 8.
     */
    maxIterations: number;
    /**
     * The preferred horizontal distance between edges exiting a vertex Default is 5.
     */
    prefHozEdgeSep: number;
    /**
     * The preferred vertical offset between edges exiting a vertex Default is 2.
     */
    prefVertEdgeOff: number;
    /**
     * The minimum distance for an edge jetty from a vertex Default is 12.
     */
    minEdgeJetty: number;
    /**
     * The size of the vertical buffer in the center of inter-rank channels
     * where edge control points should not be placed Default is 4.
     */
    channelBuffer: number;
    /**
     * Map of internal edges and (x,y) pair of positions of the start and end jetty
     * for that edge where it connects to the source and target vertices.
     * Note this should technically be a WeakHashMap, but since JS does not
     * have an equivalent, housekeeping must be performed before using.
     * i.e. check all edges are still in the model and clear the values.
     * Note that the y co-ord is the offset of the jetty, not the
     * absolute point
     */
    jettyPositions: {
        [key: string]: number[];
    } | null;
    /**
     * The position of the root ( start ) node(s) relative to the rest of the
     * laid out graph. Default is <mxConstants.DIRECTION.NORTH>.
     */
    orientation: DIRECTION;
    /**
     * The minimum x position node placement starts at
     */
    initialX: number;
    /**
     * The maximum x value this positioning lays up to
     */
    limitX: number | null;
    /**
     * The sum of x-displacements for the current iteration
     */
    currentXDelta: number | null;
    /**
     * The rank that has the widest x position
     */
    widestRank: number | null;
    /**
     * Internal cache of top-most values of Y for each rank
     */
    rankTopY: number[] | null;
    /**
     * Internal cache of bottom-most value of Y for each rank
     */
    rankBottomY: number[] | null;
    /**
     * The X-coordinate of the edge of the widest rank
     */
    widestRankValue: number | null;
    /**
     * The width of all the ranks
     */
    rankWidths: number[] | null;
    /**
     * The Y-coordinate of all the ranks
     */
    rankY: number[] | null;
    /**
     * Whether or not to perform local optimisations and iterate multiple times
     * through the algorithm. Default is true.
     */
    fineTuning: boolean;
    /**
     * A store of connections to the layer above for speed
     */
    nextLayerConnectedCache: null;
    /**
     * A store of connections to the layer below for speed
     */
    previousLayerConnectedCache: null;
    /**
     * Padding added to resized parents Default is 10.
     */
    groupPadding: number;
    /**
     * Utility method to display current positions
     */
    printStatus(): void;
    /**
     * A basic horizontal coordinate assignment algorithm
     */
    execute(parent: any): void;
    /**
     * Performs one median positioning sweep in both directions
     */
    minNode(model: GraphHierarchyModel): void;
    /**
     * Performs one median positioning sweep in one direction
     *
     * @param i the iteration of the whole process
     * @param model an internal model of the hierarchical layout
     */
    medianPos(i: number, model: GraphHierarchyModel): void;
    /**
     * Performs median minimisation over one rank.
     *
     * @param rankValue the layer number of this rank
     * @param model an internal model of the hierarchical layout
     * @param nextRankValue the layer number whose connected cels are to be laid out
     * relative to
     */
    rankMedianPosition(rankValue: number, model: GraphHierarchyModel, nextRankValue: number): void;
    /**
     * Calculates the priority the specified cell has based on the type of its
     * cell and the cells it is connected to on the next layer
     *
     * @param currentCell the cell whose weight is to be calculated
     * @param collection the cells the specified cell is connected to
     */
    calculatedWeightedValue(currentCell: Cell, collection: GraphAbstractHierarchyCell[]): number;
    /**
     * Calculates the median position of the connected cell on the specified
     * rank
     *
     * @param connectedCells the cells the candidate connects to on this level
     * @param rankValue the layer number of this rank
     */
    medianXValue(connectedCells: GraphAbstractHierarchyCell[], rankValue: number): number;
    /**
     * Sets up the layout in an initial positioning. The ranks are all centered
     * as much as possible along the middle vertex in each rank. The other cells
     * are then placed as close as possible on either side.
     *
     * @param facade the facade describing the input graph
     * @param model an internal model of the hierarchical layout
     */
    initialCoords(facade: Graph, model: GraphHierarchyModel): void;
    /**
     * Sets up the layout in an initial positioning. All the first cells in each
     * rank are moved to the left and the rest of the rank inserted as close
     * together as their size and buffering permits. This method works on just
     * the specified rank.
     *
     * @param rankValue the current rank being processed
     * @param graph the facade describing the input graph
     * @param model an internal model of the hierarchical layout
     */
    rankCoordinates(rankValue: number, graph: Graph, model: GraphHierarchyModel): void;
    /**
     * Calculates the width rank in the hierarchy. Also set the y value of each
     * rank whilst performing the calculation
     *
     * @param graph the facade describing the input graph
     * @param model an internal model of the hierarchical layout
     */
    calculateWidestRank(graph: Graph, model: GraphHierarchyModel): void;
    /**
     * Straightens out chains of virtual nodes where possibleacade to those stored after this layout
     * processing step has completed.
     *
     * @param graph the facade describing the input graph
     * @param model an internal model of the hierarchical layout
     */
    minPath(graph: Graph, model: GraphHierarchyModel): void;
    /**
     * Determines whether or not a node may be moved to the specified x
     * position on the specified rank
     *
     * @param model the layout model
     * @param cell the cell being analysed
     * @param rank the layer of the cell
     * @param position the x position being sought
     */
    repositionValid(model: GraphHierarchyModel, cell: GraphHierarchyEdge | GraphHierarchyNode, rank: number, position: number): boolean;
    /**
     * Sets the cell locations in the facade to those stored after this layout
     * processing step has completed.
     *
     * @param graph the input graph
     * @param model the layout model
     */
    setCellLocations(graph: Graph, model: GraphHierarchyModel): void;
    /**
     * Separates the x position of edges as they connect to vertices
     *
     * @param model the layout model
     */
    localEdgeProcessing(model: GraphHierarchyModel): void;
    /**
     * Fixes the control points
     */
    setEdgePosition(cell: GraphHierarchyEdge): void;
    /**
     * Fixes the position of the specified vertex.
     *
     * @param cell the vertex to position
     */
    setVertexLocation(cell: GraphHierarchyNode): void;
    /**
     * Hook to add additional processing
     *
     * @param edge the hierarchical model edge
     * @param realEdge the real edge in the graph
     */
    processReversedEdge(edge: GraphHierarchyEdge, realEdge: Cell): void;
}
export default CoordinateAssignment;
