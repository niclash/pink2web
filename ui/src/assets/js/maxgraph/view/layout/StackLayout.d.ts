import GraphLayout from './GraphLayout';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
import Geometry from '../geometry/Geometry';
/**
 * Extends {@link GraphLayout} to create a horizontal or vertical stack of the
 * child vertices. The children do not need to be connected for this layout
 * to work.
 *
 * Example:
 *
 * ```javascript
 * let layout = new mxStackLayout(graph, true);
 * layout.execute(graph.getDefaultParent());
 * ```
 *
 * Constructor: mxStackLayout
 *
 * Constructs a new stack layout layout for the specified graph,
 * spacing, orientation and offset.
 */
declare class StackLayout extends GraphLayout {
    constructor(graph: Graph, horizontal?: boolean | null, spacing?: number | null, x0?: number | null, y0?: number | null, border?: number | null);
    /**
     * Specifies the orientation of the layout.
     */
    horizontal: boolean;
    /**
     * Specifies the spacing between the cells.
     */
    spacing: number;
    /**
     * Specifies the horizontal origin of the layout.
     */
    x0: number;
    /**
     * Specifies the vertical origin of the layout.
     */
    y0: number;
    /**
     * Border to be added if fill is true.
     */
    border: number;
    /**
     * Top margin for the child area.
     */
    marginTop: number;
    /**
     * Top margin for the child area.
     */
    marginLeft: number;
    /**
     * Top margin for the child area.
     */
    marginRight: number;
    /**
     * Top margin for the child area.
     */
    marginBottom: number;
    /**
     * Boolean indicating if the location of the first cell should be kept, that is, it will not be moved to x0 or y0.
     */
    keepFirstLocation: boolean;
    /**
     * Boolean indicating if dimension should be changed to fill out the parent cell.
     */
    fill: boolean;
    /**
     * If the parent should be resized to match the width/height of the stack.
     */
    resizeParent: boolean;
    /**
     * Use maximum of existing value and new value for resize of parent.
     */
    resizeParentMax: boolean;
    /**
     * If the last element should be resized to fill out the parent.
     */
    resizeLast: boolean;
    /**
     * Value at which a new column or row should be created.
     */
    wrap: number | null;
    /**
     * If the strokeWidth should be ignored.
     */
    borderCollapse: boolean;
    /**
     * If gaps should be allowed in the stack.
     */
    allowGaps: boolean;
    /**
     * Grid size for alignment of position and size.
     */
    gridSize: number;
    /**
     * Returns horizontal.
     */
    isHorizontal(): boolean;
    /**
     * Implements mxGraphLayout.moveCell.
     */
    moveCell(cell: Cell, x: number, y: number): void;
    /**
     * Returns the size for the parent container or the size of the graph container if the parent is a layer or the root of the model.
     */
    getParentSize(parent: Cell): Geometry;
    /**
     * Returns the cells to be layouted.
     */
    getLayoutCells(parent: Cell): Cell[];
    /**
     * Snaps the given value to the grid size.
     */
    snap(value: number): number;
    /**
     * Implements mxGraphLayout.execute.
     */
    execute(parent: Cell): void;
    /**
     * Sets the specific geometry to the given child cell.
     *
     * @param child The given child of <Cell>.
     * @param geo The specific geometry of {@link Geometry}.
     */
    setChildGeometry(child: Cell, geo: Geometry): void;
    /**
     * Updates the geometry of the given parent cell.
     *
     * @param parent The given parent of <Cell>.
     * @param pgeo The new {@link Geometry} for parent.
     * @param last The last {@link Geometry}.
     */
    updateParentGeometry(parent: Cell, pgeo: Geometry, last: Geometry): void;
}
export default StackLayout;
