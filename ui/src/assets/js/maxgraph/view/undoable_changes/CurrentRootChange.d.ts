import GraphView from '../GraphView';
import Cell from '../cell/Cell';
import type { UndoableChange } from '../../types';
/**
 * Action to change the current root in a view.
 */
declare class CurrentRootChange implements UndoableChange {
    view: GraphView;
    root: Cell | null;
    previous: Cell | null;
    isUp: boolean;
    constructor(view: GraphView, root: Cell | null);
    /**
     * Changes the current root of the view.
     */
    execute(): void;
}
export default CurrentRootChange;
