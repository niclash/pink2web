import Rectangle from '../geometry/Rectangle';
import Dictionary from '../../util/Dictionary';
import GraphView from '../GraphView';
import Cell from './Cell';
import CellState from './CellState';
/**
 * Creates a temporary set of cell states.
 */
declare class TemporaryCellStates {
    oldValidateCellState: Function | null;
    oldDoRedrawShape: Function | null;
    view: GraphView;
    /**
     * Holds the states of the rectangle.
     */
    oldStates: Dictionary<Cell, CellState>;
    /**
     * Holds the bounds of the rectangle.
     */
    oldBounds: Rectangle;
    /**
     * Holds the scale of the rectangle.
     */
    oldScale: number;
    constructor(view: GraphView, scale: number | undefined, cells: Cell[], isCellVisibleFn?: Function | null, getLinkForCellState?: Function | null);
    destroy(): void;
}
export default TemporaryCellStates;
