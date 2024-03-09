import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change a terminal in a model.
 */
export declare class TerminalChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    terminal: Cell | null;
    previous: Cell | null;
    source: boolean;
    constructor(model: GraphDataModel, cell: Cell, terminal: Cell | null, source: boolean);
    /**
     * Changes the terminal of {@link cell}` to {@link previous}` using
     * <Transactions.terminalForCellChanged>.
     */
    execute(): void;
}
export default TerminalChange;
