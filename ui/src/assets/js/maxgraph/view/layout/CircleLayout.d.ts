import GraphLayout from './GraphLayout';
import { Graph } from '../Graph';
import Cell from '../cell/Cell';
/**
 * Extends {@link GraphLayout} to implement a circular layout for a given radius.
 * The vertices do not need to be connected for this layout to work and all
 * connections between vertices are not taken into account.
 *
 * Example:
 *
 * ```javascript
 * let layout = new mxCircleLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * ```
 *
 * Constructor: mxCircleLayout
 *
 * Constructs a new circular layout for the specified radius.
 *
 * Arguments:
 *
 * graph - {@link Graph} that contains the cells.
 * radius - Optional radius as an int. Default is 100.
 */
declare class CircleLayout extends GraphLayout {
    constructor(graph: Graph, radius?: number);
    /**
     * Integer specifying the size of the radius. Default is 100.
     */
    radius: number;
    /**
     * Boolean specifying if the circle should be moved to the top,
     * left corner specified by <x0> and <y0>. Default is false.
     */
    moveCircle: boolean;
    /**
     * Integer specifying the left coordinate of the circle.
     * Default is 0.
     */
    x0: number;
    /**
     * Integer specifying the top coordinate of the circle.
     * Default is 0.
     */
    y0: number;
    /**
     * Specifies if all edge points of traversed edges should be removed.
     * Default is true.
     */
    resetEdges: boolean;
    /**
     * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
     * modified by the result. Default is true.
     */
    disableEdgeStyle: boolean;
    /**
     * Implements {@link GraphLayout#execute}.
     */
    execute(parent: Cell): void;
    /**
     * Returns the radius to be used for the given vertex count. Max is the maximum
     * width or height of all vertices in the layout.
     */
    getRadius(count: number, max: number): number;
    /**
     * Executes the circular layout for the specified array
     * of vertices and the given radius. This is called from
     * <execute>.
     */
    circle(vertices: Cell[], r: number, left: number, top: number): void;
}
export default CircleLayout;
