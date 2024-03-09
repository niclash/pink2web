import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change a cell's visible state in a model.
 *
 * Constructor: mxVisibleChange
 *
 * Constructs a change of a visible state in the
 * specified model.
 */
declare class VisibleChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    visible: boolean;
    previous: boolean;
    constructor(model: GraphDataModel, cell: Cell, visible: boolean);
    /**
     * Changes the visible state of {@link cell}` to {@link previous}` using
     * <Transactions.visibleStateForCellChanged>.
     */
    execute(): void;
}
export default VisibleChange;
