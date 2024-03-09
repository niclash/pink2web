import GraphLayout from './GraphLayout';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
/**
 * Extends {@link GraphLayout} for partitioning the parent cell vertically or
 * horizontally by filling the complete area with the child cells. A horizontal
 * layout partitions the height of the given parent whereas a a non-horizontal
 * layout partitions the width. If the parent is a layer (that is, a child of
 * the root node), then the current graph size is partitioned. The children do
 * not need to be connected for this layout to work.
 *
 * Example:
 *
 * ```javascript
 * var layout = new mxPartitionLayout(graph, true, 10, 20);
 * layout.execute(graph.getDefaultParent());
 * ```
 * @class
 */
declare class PartitionLayout extends GraphLayout {
    constructor(graph: Graph, horizontal?: boolean, spacing?: number, border?: number);
    /**
     * Boolean indicating the direction in which the space is partitioned.
     * Default is true.
     */
    horizontal: boolean;
    /**
     * Integer that specifies the absolute spacing in pixels between the
     * children. Default is 0.
     */
    spacing: number;
    /**
     * Integer that specifies the absolute inset in pixels for the parent that
     * contains the children. Default is 0.
     */
    border: number;
    /**
     * Boolean that specifies if vertices should be resized. Default is true.
     */
    resizeVertices: boolean;
    /**
     * Returns <horizontal>.
     */
    isHorizontal(): boolean;
    /**
     * Implements {@link GraphLayout.moveCell}.
     *
     * @param {mxCell} cell
     * @param {number} x
     * @param {number} y
     * @memberof mxPartitionLayout
     */
    moveCell(cell: Cell, x: number, y: number): void;
    /**
     * Implements {@link GraphLayout#execute}. All children where <isVertexIgnored>
     * returns false and <isVertexMovable> returns true are modified.
     */
    execute(parent: Cell): void;
}
export default PartitionLayout;
