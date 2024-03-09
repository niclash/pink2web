import Cell from './Cell';
/**
 * Implements a mechanism for temporary cell Ids.
 * @class CellPath
 */
declare class CellPath {
    constructor();
    /**
     * Defines the separator between the path components. Default is ".".
     */
    static PATH_SEPARATOR: string;
    /**
     * Creates the cell path for the given cell. The cell path is a
     * concatenation of the indices of all ancestors on the (finite) path to
     * the root, eg. "0.0.0.1".
     *
     * @param cell Cell whose path should be returned.
     */
    static create(cell: Cell): string;
    /**
     * Returns the path for the parent of the cell represented by the given
     * path. Returns null if the given path has no parent.
     *
     * @param path Path whose parent path should be returned.
     */
    static getParentPath(path: string): string | null;
    /**
     * Returns the cell for the specified cell path using the given root as the
     * root of the path.
     *
     * @param root Root cell of the path to be resolved.
     * @param path String that defines the path.
     */
    static resolve(root: Cell, path: string): Cell;
    /**
     * Compares the given cell paths and returns -1 if p1 is smaller, 0 if
     * p1 is equal and 1 if p1 is greater than p2.
     */
    static compare(p1: string[], p2: string[]): number;
}
export default CellPath;
