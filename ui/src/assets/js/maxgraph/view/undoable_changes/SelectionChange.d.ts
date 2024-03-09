import type { UndoableChange } from '../../types';
import type { Graph } from '../Graph';
import Cell from '../cell/Cell';
/**
 * @class SelectionChange
 * Action to change the current root in a view.
 */
declare class SelectionChange implements UndoableChange {
    constructor(graph: Graph, added?: Cell[], removed?: Cell[]);
    graph: Graph;
    added: Cell[];
    removed: Cell[];
    /**
     * Changes the current root of the view.
     */
    execute(): void;
}
export default SelectionChange;
