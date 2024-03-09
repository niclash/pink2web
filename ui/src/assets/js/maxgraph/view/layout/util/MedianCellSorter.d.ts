import GraphAbstractHierarchyCell from '../datatypes/GraphAbstractHierarchyCell';
/**
 * Class: MedianCellSorter
 *
 * A utility class used to track cells whilst sorting occurs on the median
 * values. Does not violate (x.compareTo(y)==0) == (x.equals(y))
 *
 * Constructor: MedianCellSorter
 *
 * Constructs a new median cell sorter.
 */
declare class MedianCellSorter {
    constructor();
    /**
     * The weighted value of the cell stored.
     */
    medianValue: number;
    /**
     * The cell whose median value is being calculated
     */
    cell: GraphAbstractHierarchyCell | boolean;
    /**
     * Compares two MedianCellSorters.
     */
    compare(a: MedianCellSorter, b: MedianCellSorter): 0 | 1 | -1;
}
export default MedianCellSorter;
