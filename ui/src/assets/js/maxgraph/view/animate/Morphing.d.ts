import Point from '../geometry/Point';
import CellStatePreview from '../cell/CellStatePreview';
import Animation from './Animation';
import CellState from '../cell/CellState';
import Cell from '../cell/Cell';
import { Graph } from '../Graph';
/**
 * Implements animation for morphing cells. Here is an example of
 * using this class for animating the result of a layout algorithm:
 *
 * ```javascript
 * graph.getDataModel().beginUpdate();
 * try
 * {
 *   let circleLayout = new mxCircleLayout(graph);
 *   circleLayout.execute(graph.getDefaultParent());
 * }
 * finally
 * {
 *   let morph = new Morphing(graph);
 *   morph.addListener(mxEvent.DONE, ()=>
 *   {
 *     graph.getDataModel().endUpdate();
 *   });
 *
 *   morph.startAnimation();
 * }
 * ```
 *
 * Constructor: Morphing
 *
 * Constructs an animation.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 * @param steps Optional number of steps in the morphing animation. Default is 6.
 * @param ease Optional easing constant for the animation. Default is 1.5.
 * @param delay Optional delay between the animation steps. Passed to <Animation>.
 */
declare class Morphing extends Animation {
    constructor(graph: Graph, steps?: number, ease?: number, delay?: number);
    /**
     * Specifies the delay between the animation steps. Defaul is 30ms.
     */
    graph: Graph;
    /**
     * Specifies the maximum number of steps for the morphing.
     */
    steps: number;
    /**
     * Contains the current step.
     */
    step: number;
    /**
     * Ease-off for movement towards the given vector. Larger values are
     * slower and smoother. Default is 4.
     */
    ease: number;
    /**
     * Optional array of cells to be animated. If this is not specified
     * then all cells are checked and animated if they have been moved
     * in the current transaction.
     */
    cells: Cell[] | null;
    /**
     * Animation step.
     */
    updateAnimation(): void;
    /**
     * Shows the changes in the given <CellStatePreview>.
     */
    show(move: CellStatePreview): void;
    /**
     * Animates the given cell state using <CellStatePreview.moveState>.
     */
    animateCell(cell: Cell, move: CellStatePreview, recurse?: boolean): void;
    /**
     * Returns true if the animation should not recursively find more
     * deltas for children if the given parent state has been animated.
     */
    stopRecursion(state?: CellState | null, delta?: Point | null): boolean;
    /**
     * Returns the vector between the current rendered state and the future
     * location of the state after the display will be updated.
     */
    getDelta(state: CellState): Point;
    /**
     * Returns the top, left corner of the given cell. TODO: Improve performance
     * by using caching inside this method as the result per cell never changes
     * during the lifecycle of this object.
     */
    getOriginForCell(cell?: Cell | null): Point | null;
}
export default Morphing;
