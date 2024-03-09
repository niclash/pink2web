import Cell from '../view/cell/Cell';
/**
 * Returns the cells from the given array where the given filter function
 * returns true.
 */
export declare const filterCells: (filter: Function) => (cells: Cell[]) => Cell[];
/**
 * Returns all opposite vertices wrt terminal for the given edges, only
 * returning sources and/or targets as specified. The result is returned
 * as an array of {@link Cell}.
 *
 * @param {Cell} terminal  that specifies the known end of the edges.
 * @param sources  Boolean that specifies if source terminals should be contained
 * in the result. Default is true.
 * @param targets  Boolean that specifies if target terminals should be contained
 * in the result. Default is true.
 */
export declare const getOpposites: (terminal: Cell, sources?: boolean, targets?: boolean) => (edges: Cell[]) => Cell[];
/**
 * Returns the topmost cells of the hierarchy in an array that contains no
 * descendants for each {@link Cell} that it contains. Duplicates should be
 * removed in the cells array to improve performance.
 */
export declare const getTopmostCells: (cells: Cell[]) => Cell[];
/**
 * Returns an array that represents the set (no duplicates) of all parents
 * for the given array of cells.
 */
export declare const getParents: (cells: Cell[]) => Cell[];
/**
 * Returns an array of clones for the given array of {@link Cell}`.
 * Depending on the value of includeChildren, a deep clone is created for
 * each cell. Connections are restored based if the corresponding
 * cell is contained in the passed in array.
 *
 * @param includeChildren  Boolean indicating if the cells should be cloned
 * with all descendants.
 * @param mapping  Optional mapping for existing clones.
 */
export declare const cloneCells: (includeChildren?: boolean, mapping?: any) => (cells: Cell[]) => Cell[];
/**
 * Inner helper method for restoring the connections in
 * a network of cloned cells.
 *
 * @private
 */
export declare const restoreClone: (clone: Cell, cell: Cell, mapping: any) => (cells: Cell[]) => void;
