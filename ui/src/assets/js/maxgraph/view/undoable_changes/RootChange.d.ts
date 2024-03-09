import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change the root in a model.
 *
 * Constructor: mxRootChange
 *
 * Constructs a change of the root in the
 * specified model.
 *
 * @class RootChange
 */
export declare class RootChange implements UndoableChange {
    model: GraphDataModel;
    root: Cell | null;
    previous: Cell | null;
    constructor(model: GraphDataModel, root: Cell | null);
    /**
     * Carries out a change of the root using
     * <Transactions.rootChanged>.
     */
    execute(): void;
}
export default RootChange;
