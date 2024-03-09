import CellState from './CellState';
import { Graph } from '../Graph';
import Shape from '../geometry/Shape';
import type { ColorValue } from '../../types';
/**
 * A helper class to highlight cells. Here is an example for a given cell.
 *
 * ```javascript
 * var highlight = new mxCellHighlight(graph, '#ff0000', 2);
 * highlight.highlight(graph.view.getState(cell)));
 * ```
 */
declare class CellHighlight {
    highlightColor: ColorValue;
    strokeWidth: number;
    dashed: boolean;
    opacity: number;
    repaintHandler: Function;
    shape: Shape | null;
    /**
     * Specifies if the highlights should appear on top of everything else in the overlay pane.
     * @default false
     */
    keepOnTop: boolean;
    /**
     * Reference to the enclosing {@link graph}.
     * @default true
     */
    graph: Graph;
    /**
     * Reference to the {@link CellState}.
     * @default null
     */
    state: CellState | null;
    /**
     * Specifies the spacing between the highlight for vertices and the vertex.
     * @default 2
     */
    spacing: number;
    /**
     * Holds the handler that automatically invokes reset if the highlight should be hidden.
     * @default null
     */
    resetHandler: Function;
    constructor(graph: Graph, highlightColor?: ColorValue, strokeWidth?: number, dashed?: boolean);
    /**
     * Sets the color of the rectangle used to highlight drop targets.
     *
     * @param {string} color - String that represents the new highlight color.
     */
    setHighlightColor(color: ColorValue): void;
    /**
     * Creates and returns the highlight shape for the given state.
     */
    drawHighlight(): void;
    /**
     * Creates and returns the highlight shape for the given state.
     */
    createShape(): Shape | null;
    /**
     * Updates the highlight after a change of the model or view.
     */
    getStrokeWidth(state?: CellState | null): number;
    /**
     * Updates the highlight after a change of the model or view.
     */
    repaint(): void;
    /**
     * Resets the state of the cell marker.
     */
    hide(): void;
    /**
     * Marks the {@link arkedState} and fires a {@link ark} event.
     */
    highlight(state?: CellState | null): void;
    /**
     * Returns true if this highlight is at the given position.
     */
    isHighlightAt(x: number, y: number): boolean;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    destroy(): void;
}
export default CellHighlight;
