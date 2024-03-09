import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change a user object in a model.
 *
 * Constructs a change of a user object in the
 * specified model.
 *
 * @class ValueChange
 */
declare class ValueChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    value: unknown;
    previous: unknown;
    constructor(model: GraphDataModel, cell: Cell, value: unknown);
    /**
     * Changes the value of {@link cell}` to {@link previous}` using
     * <Transactions.valueForCellChanged>.
     */
    execute(): void;
}
export default ValueChange;
