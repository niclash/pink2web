import type CellState from '../cell/CellState';
import { DIRECTION } from '../../util/Constants';
import Geometry from '../geometry/Geometry';
import type { EdgeStyleFunction } from '../../types';
/**
 * Provides various edge styles to be used as the values for `edgeStyle` in a cell style.
 *
 * Example:
 *
 * ```javascript
 * let style = stylesheet.getDefaultEdgeStyle();
 * style.edgeStyle = EdgeStyle.ElbowConnector;
 * ```
 *
 * Sets the default edge style to `ElbowConnector`.
 *
 * Custom edge style:
 *
 * To write a custom edge style, a function must be added to the EdgeStyle object as follows:
 *
 * ```javascript
 * EdgeStyle.MyStyle = (state, source, target, points, result)=>
 * {
 *   if (source != null && target != null)
 *   {
 *     let pt = new Point(target.getCenterX(), source.getCenterY());
 *
 *     if (Utils.contains(source, pt.x, pt.y))
 *     {
 *       pt.y = source.y + source.height;
 *     }
 *
 *     result.push(pt);
 *   }
 * };
 * ```
 *
 * In the above example, a right angle is created using a point on the
 * horizontal center of the target vertex and the vertical center of the source
 * vertex. The code checks if that point intersects the source vertex and makes
 * the edge straight if it does. The point is then added into the result array,
 * which acts as the return value of the function.
 *
 * The new edge style should then be registered in the {@link StyleRegistry} as follows:
 * ```javascript
 * StyleRegistry.putValue('myEdgeStyle', EdgeStyle.MyStyle);
 * ```
 *
 * The custom edge style above can now be used in a specific edge as follows:
 *
 * ```javascript
 * style.edgeStyle = 'myEdgeStyle';
 * ```
 *
 * Note that the key of the {@link StyleRegistry} entry for the function should
 * be used in string values, unless {@link GraphView#allowEval} is true, in
 * which case you can also use `EdgeStyle.MyStyle` for the value in the
 * cell style above.
 *
 * Or it can be used for all edges in the graph as follows:
 *
 * ```javascript
 * let style = graph.getStylesheet().getDefaultEdgeStyle();
 * style.edgeStyle = EdgeStyle.MyStyle;
 * ```
 *
 * Note that the object can be used directly when programmatically setting
 * the value, but the key in the {@link StyleRegistry} should be used when
 * setting the value via a key, value pair in a cell style.
 */
declare class EdgeStyle {
    /**
     * Implements an entity relation style for edges (as used in database
     * schema diagrams). At the time the function is called, the result
     * array contains a placeholder (null) for the first absolute point,
     * that is, the point where the edge and source terminal are connected.
     * The implementation of the style then adds all intermediate waypoints
     * except for the last point, that is, the connection point between the
     * edge and the target terminal. The first ant the last point in the
     * result array are then replaced with Point that take into account
     * the terminal's perimeter and next point on the edge.
     *
     * @param state {@link CellState} that represents the edge to be updated.
     * @param source {@link CellState} that represents the source terminal.
     * @param target {@link CellState} that represents the target terminal.
     * @param points List of relative control points.
     * @param result Array of {@link Point} that represent the actual points of the edge.
     */
    static EntityRelation: EdgeStyleFunction;
    /**
     * Implements a self-reference, aka. loop.
     */
    static Loop: EdgeStyleFunction;
    /**
     * Uses either {@link SideToSide} or {@link TopToBottom} depending on the horizontal flag in the cell style.
     * {@link SideToSide} is used if horizontal is `true` or unspecified.
     */
    static ElbowConnector: EdgeStyleFunction;
    /**
     * Implements a vertical elbow edge.
     */
    static SideToSide: EdgeStyleFunction;
    /**
     * Implements a horizontal elbow edge.
     */
    static TopToBottom: EdgeStyleFunction;
    /**
     * Implements an orthogonal edge style. Use {@link EdgeSegmentHandler}
     * as an interactive handler for this style.
     *
     * @param state {@link CellState} that represents the edge to be updated.
     * @param sourceScaled {@link CellState} that represents the source terminal.
     * @param targetScaled {@link CellState} that represents the target terminal.
     * @param controlHints List of relative control points.
     * @param result Array of {@link Point} that represent the actual points of the edge.
     */
    static SegmentConnector: EdgeStyleFunction;
    static orthBuffer: number;
    static orthPointsFallback: boolean;
    static dirVectors: number[][];
    static wayPoints1: number[][];
    static routePatterns: number[][][];
    static inlineRoutePatterns: (number[] | null)[][];
    static vertexSeperations: any;
    static limits: number[][];
    static LEFT_MASK: number;
    static TOP_MASK: number;
    static RIGHT_MASK: number;
    static BOTTOM_MASK: number;
    static LEFT: number;
    static TOP: number;
    static RIGHT: number;
    static BOTTOM: number;
    static SIDE_MASK: number;
    static CENTER_MASK: number;
    static SOURCE_MASK: number;
    static TARGET_MASK: number;
    static VERTEX_MASK: number;
    static getJettySize(state: CellState, isSource: boolean): any;
    /**
     * Implements a local orthogonal router between the given cells.
     *
     * @param state {@link CellState} that represents the edge to be updated.
     * @param sourceScaled {@link CellState} that represents the source terminal.
     * @param targetScaled {@link CellState} that represents the target terminal.
     * @param controlHints List of relative control {@link Point}s.
     * @param result Array of {@link Point}s that represent the actual points of the
     * edge.
     */
    static OrthConnector: EdgeStyleFunction;
    static MANHATTAN_STEP: number;
    static MANHATTAN_MAXIMUM_LOOPS: number;
    static MANHATTAN_START_DIRECTIONS: DIRECTION[];
    static MANHATTAN_END_DIRECTIONS: DIRECTION[];
    static MANHATTAN_MAX_ALLOWED_DIRECTION_CHANGE: number;
    static MANHATTAN_PADDING_BOX: Geometry;
    /**
     * ManhattanConnector code is based on code from https://github.com/mwangm/mxgraph-manhattan-connector
     *
     * Implements router to find the shortest route that avoids cells using manhattan distance as metric.
     */
    static ManhattanConnector: EdgeStyleFunction;
    static getRoutePattern(dir: number[], quad: number, dx: number, dy: number): number[] | null;
}
export default EdgeStyle;
