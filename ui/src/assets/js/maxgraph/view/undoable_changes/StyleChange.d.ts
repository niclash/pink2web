import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { CellStyle, UndoableChange } from '../../types';
/**
 * Action to change a cell's style in a model.
 *
 * @class StyleChange
 */
declare class StyleChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    style: CellStyle;
    previous: CellStyle;
    constructor(model: GraphDataModel, cell: Cell, style: CellStyle);
    /**
     * Changes the style of {@link cell}` to {@link previous}` using
     * <Transactions.styleForCellChanged>.
     */
    execute(): void;
}
export default StyleChange;
