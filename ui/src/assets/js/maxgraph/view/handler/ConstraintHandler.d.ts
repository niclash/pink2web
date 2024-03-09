import Image from '../image/ImageBox';
import Rectangle from '../geometry/Rectangle';
import ImageShape from '../geometry/node/ImageShape';
import RectangleShape from '../geometry/node/RectangleShape';
import { Graph } from '../Graph';
import CellState from '../cell/CellState';
import InternalMouseEvent from '../event/InternalMouseEvent';
import ConnectionConstraint from '../other/ConnectionConstraint';
import Point from '../geometry/Point';
import Cell from '../cell/Cell';
/**
 * Handles constraints on connection targets. This class is in charge of
 * showing fixed points when the mouse is over a vertex and handles constraints
 * to establish new connections.
 *
 * @class ConstraintHandler
 */
declare class ConstraintHandler {
    /**
     * {@link Image} to be used as the image for fixed connection points.
     */
    pointImage: Image;
    /**
     * Reference to the enclosing {@link mxGraph}.
     */
    graph: Graph;
    resetHandler: () => void;
    currentFocus: CellState | null;
    currentFocusArea: Rectangle | null;
    focusIcons: ImageShape[];
    constraints: ConnectionConstraint[] | null;
    currentConstraint: ConnectionConstraint | null;
    focusHighlight: RectangleShape | null;
    focusPoints: Point[];
    currentPoint: Point | null;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Specifies the color for the highlight. Default is {@link DEFAULT_VALID_COLOR}.
     */
    highlightColor: string;
    mouseleaveHandler: (() => void) | null;
    constructor(graph: Graph);
    /**
     * Returns true if events are handled. This implementation
     * returns {@link enabled}.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation
     * updates {@link enabled}.
     *
     * @param {boolean} enabled - Boolean that specifies the new enabled state.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Resets the state of this handler.
     */
    reset(): void;
    /**
     * Returns the tolerance to be used for intersecting connection points. This
     * implementation returns {@link mxGraph.tolerance}.
     *
     * @param me {@link mxMouseEvent} whose tolerance should be returned.
     */
    getTolerance(me: InternalMouseEvent): number;
    /**
     * Returns the tolerance to be used for intersecting connection points.
     */
    getImageForConstraint(state: CellState, constraint: ConnectionConstraint, point: Point): Image;
    /**
     * Returns true if the given {@link mxMouseEvent} should be ignored in {@link update}. This
     * implementation always returns false.
     */
    isEventIgnored(me: InternalMouseEvent, source?: boolean): boolean;
    /**
     * Returns true if the given state should be ignored. This always returns false.
     */
    isStateIgnored(state: CellState, source?: boolean): boolean;
    /**
     * Destroys the {@link focusIcons} if they exist.
     */
    destroyIcons(): void;
    /**
     * Destroys the {@link focusHighlight} if one exists.
     */
    destroyFocusHighlight(): void;
    /**
     * Returns true if the current focused state should not be changed for the given event.
     * This returns true if shift and alt are pressed.
     */
    isKeepFocusEvent(me: InternalMouseEvent): boolean;
    /**
     * Returns the cell for the given event.
     */
    getCellForEvent(me: InternalMouseEvent, point: Point | null): Cell | null;
    /**
     * Updates the state of this handler based on the given {@link mxMouseEvent}.
     * Source is a boolean indicating if the cell is a source or target.
     */
    update(me: InternalMouseEvent, source: boolean, existingEdge: boolean, point: Point | null): void;
    /**
     * Transfers the focus to the given state as a source or target terminal. If
     * the handler is not enabled then the outline is painted, but the constraints
     * are ignored.
     */
    redraw(): void;
    /**
     * Transfers the focus to the given state as a source or target terminal. If
     * the handler is not enabled then the outline is painted, but the constraints
     * are ignored.
     */
    setFocus(me: InternalMouseEvent, state: CellState | null, source: boolean): void;
    /**
     * Create the shape used to paint the highlight.
     *
     * Returns true if the given icon intersects the given point.
     */
    createHighlightShape(): RectangleShape;
    /**
     * Returns true if the given icon intersects the given rectangle.
     */
    intersects(icon: ImageShape, mouse: Rectangle, source: boolean, existingEdge: boolean): boolean;
    /**
     * Destroy this handler.
     */
    onDestroy(): void;
}
export default ConstraintHandler;
