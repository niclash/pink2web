import { _mxCompactTreeLayoutNode } from '../CompactTreeLayout';
import GraphAbstractHierarchyCell from '../datatypes/GraphAbstractHierarchyCell';
/**
 * @class WeightedCellSorter
 *
 * A utility class used to track cells whilst sorting occurs on the weighted
 * sum of their connected edges. Does not violate (x.compareTo(y)==0) ==
 * (x.equals(y))
 *
 */
declare class WeightedCellSorter {
    constructor(cell: _mxCompactTreeLayoutNode | GraphAbstractHierarchyCell, weightedValue?: number);
    /**
     * The weighted value of the cell stored.
     */
    weightedValue: number;
    /**
     * Whether or not to flip equal weight values.
     */
    nudge: boolean;
    /**
     * Whether or not this cell has been visited in the current assignment.
     */
    visited: boolean;
    /**
     * The index this cell is in the model rank.
     */
    rankIndex: number | null;
    /**
     * The cell whose median value is being calculated.
     */
    cell: _mxCompactTreeLayoutNode | GraphAbstractHierarchyCell;
    /**
     * Compares two WeightedCellSorters.
     */
    static compare(a: WeightedCellSorter, b: WeightedCellSorter): number;
}
export default WeightedCellSorter;
