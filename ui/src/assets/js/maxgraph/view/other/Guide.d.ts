import Point from '../geometry/Point';
import PolylineShape from '../geometry/edge/PolylineShape';
import CellState from '../cell/CellState';
import Shape from '../geometry/Shape';
import Rectangle from '../geometry/Rectangle';
import { Graph } from '../Graph';
/**
 * Implements the alignment of selection cells to other cells in the graph.
 *
 * Constructor: mxGuide
 *
 * Constructs a new guide object.
 */
declare class Guide {
    constructor(graph: Graph, states: CellState[]);
    /**
     * Reference to the enclosing {@link Graph} instance.
     */
    graph: Graph;
    /**
     * Contains the {@link CellStates} that are used for alignment.
     */
    states: CellState[];
    /**
     * Specifies if horizontal guides are enabled. Default is true.
     */
    horizontal: boolean;
    /**
     * Specifies if vertical guides are enabled. Default is true.
     */
    vertical: boolean;
    /**
     * Holds the {@link Shape} for the horizontal guide.
     */
    guideX: Shape | null;
    /**
     * Holds the {@link Shape} for the vertical guide.
     */
    guideY: Shape | null;
    /**
     * Specifies if rounded coordinates should be used. Default is false.
     */
    rounded: boolean;
    /**
     * Default tolerance in px if grid is disabled. Default is 2.
     */
    tolerance: number;
    /**
     * Sets the {@link CellState}s that should be used for alignment.
     */
    setStates(states: CellState[]): void;
    /**
     * Returns true if the guide should be enabled for the given native event. This
     * implementation always returns true.
     */
    isEnabledForEvent(evt: MouseEvent): boolean;
    /**
     * Returns the tolerance for the guides. Default value is gridSize / 2.
     */
    getGuideTolerance(gridEnabled?: boolean): number;
    /**
     * Returns the mxShape to be used for painting the respective guide. This
     * implementation returns a new, dashed and crisp {@link PolylineShape} using
     * {@link GUIDE_COLOR} and {@link GUIDE_STROKEWIDTH} as the format.
     *
     * @param horizontal Boolean that specifies which guide should be created.
     */
    createGuideShape(horizontal?: boolean): PolylineShape;
    /**
     * Returns true if the given state should be ignored.
     * @param state
     */
    isStateIgnored(state: CellState): boolean;
    /**
     * Moves the <bounds> by the given {@link Point} and returnt the snapped point.
     */
    move(bounds: Rectangle | null | undefined, delta: Point, gridEnabled?: boolean, clone?: boolean): Point;
    /**
     * Rounds to pixels for virtual states (eg. page guides)
     */
    getDelta(bounds: Rectangle, stateX: CellState | null | undefined, dx: number, stateY: CellState | null | undefined, dy: number): Point;
    /**
     * Hides all current guides.
     */
    getGuideColor(state: CellState, horizontal: boolean): string;
    /**
     * Hides all current guides.
     */
    hide(): void;
    /**
     * Shows or hides the current guides.
     */
    setVisible(visible: boolean): void;
    /**
     * Destroys all resources that this object uses.
     */
    destroy(): void;
}
export default Guide;
