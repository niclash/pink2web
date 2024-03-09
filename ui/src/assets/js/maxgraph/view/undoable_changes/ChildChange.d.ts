import GraphDataModel from '../GraphDataModel';
import Cell from '../cell/Cell';
import type { UndoableChange } from '../../types';
/**
 * Action to add or remove a child in a model.
 *
 * Constructor: mxChildChange
 *
 * Constructs a change of a child in the
 * specified model.
 *
 * @class ChildChange
 */
export declare class ChildChange implements UndoableChange {
    model: GraphDataModel;
    parent: Cell | null;
    child: Cell;
    previous: Cell | null;
    index: number;
    previousIndex: number;
    constructor(model: GraphDataModel, parent: Cell | null, child: Cell, index?: number);
    /**
     * Changes the parent of {@link child}` using
     * <Transactions.parentForCellChanged> and
     * removes or restores the cell's
     * connections.
     */
    execute(): void;
    /**
     * Disconnects the given cell recursively from its
     * terminals and stores the previous terminal in the
     * cell's terminals.
     *
     * @warning doc from mxGraph source code is incorrect
     */
    connect(cell: Cell, isConnect?: boolean): void;
}
export default ChildChange;
