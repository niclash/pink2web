import Point from '../geometry/Point';
import Dictionary from '../../util/Dictionary';
import CellState from './CellState';
import Cell from './Cell';
import { Graph } from '../Graph';
/**
 * @class CellStatePreview
 *
 * Implements a live preview for moving cells.
 */
declare class CellStatePreview {
    constructor(graph: Graph);
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Reference to the enclosing {@link Graph}.
     */
    deltas: Dictionary<Cell, {
        point: Point;
        state: CellState;
    }>;
    /**
     * Contains the number of entries in the map.
     */
    count: number;
    /**
     * Returns true if this contains no entries.
     */
    isEmpty(): boolean;
    /**
     *
     * @param {CellState} state
     * @param {number} dx
     * @param {number} dy
     * @param {boolean} add
     * @param {boolean} includeEdges
     * @return {*}  {mxPoint}
     * @memberof mxCellStatePreview
     */
    moveState(state: CellState, dx: number, dy: number, add?: boolean, includeEdges?: boolean): Point;
    /**
     *
     * @param {Function} visitor
     * @memberof mxCellStatePreview
     */
    show(visitor?: Function | null): void;
    /**
     *
     * @param {CellState} state
     * @param {number} dx
     * @param {number} dy
     * @memberof mxCellStatePreview
     */
    translateState(state: CellState, dx: number, dy: number): void;
    /**
     *
     * @param {CellState} state
     * @param {number} dx
     * @param {number} dy
     * @param {Function} visitor
     * @memberof mxCellStatePreview
     */
    revalidateState(state: CellState, dx: number, dy: number, visitor?: Function | null): void;
    /**
     *
     * @param {CellState} state
     * @memberof mxCellStatePreview
     */
    addEdges(state: CellState): void;
}
export default CellStatePreview;
