import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change a cell's collapsed state in a model.
 *
 * Constructor: mxCollapseChange
 *
 * Constructs a change of a collapsed state in the
 * specified model.
 */
declare class CollapseChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    collapsed: boolean;
    previous: boolean;
    constructor(model: GraphDataModel, cell: Cell, collapsed: boolean);
    /**
     * Changes the collapsed state of {@link cell}` to {@link previous}` using
     * <Transactions.collapsedStateForCellChanged>.
     */
    execute(): void;
}
export default CollapseChange;
