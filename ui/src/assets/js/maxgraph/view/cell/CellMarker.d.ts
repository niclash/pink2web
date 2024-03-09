import EventSource from '../event/EventSource';
import CellHighlight from './CellHighlight';
import { Graph } from '../Graph';
import { ColorValue } from '../../types';
import CellState from './CellState';
import InternalMouseEvent from '../event/InternalMouseEvent';
import Cell from './Cell';
/**
 * A helper class to process mouse locations and highlight cells.
 *
 * Helper class to highlight cells. To add a cell marker to an existing graph
 * for highlighting all cells, the following code is used:
 *
 * ```javascript
 * let marker = new mxCellMarker(graph);
 * graph.addMouseListener({
 *   mouseDown: ()=> {},
 *   mouseMove: (sender, me)=>
 *   {
 *     marker.process(me);
 *   },
 *   mouseUp: ()=> {}
 * });
 * ```
 *
 * Event: mxEvent.MARK
 *
 * Fires after a cell has been marked or unmarked. The <code>state</code>
 * property contains the marked <CellState> or null if no state is marked.
 *
 * Constructor: mxCellMarker
 *
 * Constructs a new cell marker.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 * @param validColor Optional marker color for valid states. Default is
 * {@link Constants#DEFAULT_VALID_COLOR}.
 * @param invalidColor Optional marker color for invalid states. Default is
 * {@link Constants#DEFAULT_INVALID_COLOR}.
 * @param hotspot Portion of the width and hight where a state intersects a
 * given coordinate pair. A value of 0 means always highlight. Default is
 * {@link Constants#DEFAULT_HOTSPOT}.
 */
declare class CellMarker extends EventSource {
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Specifies if the marker is enabled. Default is true.
     */
    enabled: boolean;
    /**
     * Specifies the portion of the width and height that should trigger
     * a highlight. The area around the center of the cell to be marked is used
     * as the hotspot. Possible values are between 0 and 1. Default is
     * mxConstants.DEFAULT_HOTSPOT.
     */
    hotspot: number;
    /**
     * Specifies if the hotspot is enabled. Default is false.
     */
    hotspotEnabled: boolean;
    /**
     * Holds the valid marker color.
     */
    validColor: ColorValue;
    /**
     * Holds the invalid marker color.
     */
    invalidColor: ColorValue;
    /**
     * Holds the current marker color.
     */
    currentColor: ColorValue;
    /**
     * Holds the marked <CellState> if it is valid.
     */
    validState: CellState | null;
    /**
     * Holds the marked <CellState>.
     */
    markedState: CellState | null;
    highlight: CellHighlight;
    constructor(graph: Graph, validColor?: ColorValue, invalidColor?: ColorValue, hotspot?: number);
    /**
     * Enables or disables event handling. This implementation
     * updates <enabled>.
     *
     * @param enabled Boolean that specifies the new enabled state.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns true if events are handled. This implementation
     * returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Sets the <hotspot>.
     */
    setHotspot(hotspot: number): void;
    /**
     * Returns the <hotspot>.
     */
    getHotspot(): number;
    /**
     * Specifies whether the hotspot should be used in <intersects>.
     */
    setHotspotEnabled(enabled: boolean): void;
    /**
     * Returns true if hotspot is used in <intersects>.
     */
    isHotspotEnabled(): boolean;
    /**
     * Returns true if <validState> is not null.
     */
    hasValidState(): boolean;
    /**
     * Returns the <validState>.
     */
    getValidState(): CellState | null;
    /**
     * Returns the {@link arkedState}.
     */
    getMarkedState(): CellState | null;
    /**
     * Resets the state of the cell marker.
     */
    reset(): void;
    /**
     * Processes the given event and cell and marks the state returned by
     * <getState> with the color returned by <getMarkerColor>. If the
     * markerColor is not null, then the state is stored in {@link arkedState}. If
     * <isValidState> returns true, then the state is stored in <validState>
     * regardless of the marker color. The state is returned regardless of the
     * marker color and valid state.
     */
    process(me: InternalMouseEvent): CellState | null;
    /**
     * Sets and marks the current valid state.
     */
    setCurrentState(state: CellState | null, me: InternalMouseEvent, color?: ColorValue): void;
    /**
     * Marks the given cell using the given color, or <validColor> if no color is specified.
     */
    markCell(cell: Cell, color: ColorValue): void;
    /**
     * Marks the {@link arkedState} and fires a {@link ark} event.
     */
    mark(): void;
    /**
     * Hides the marker and fires a {@link ark} event.
     */
    unmark(): void;
    /**
     * Returns true if the given <CellState> is a valid state. If this
     * returns true, then the state is stored in <validState>. The return value
     * of this method is used as the argument for <getMarkerColor>.
     */
    isValidState(state: CellState): boolean;
    /**
     * Returns the valid- or invalidColor depending on the value of isValid.
     * The given <CellState> is ignored by this implementation.
     */
    getMarkerColor(evt: Event, state: CellState | null, isValid: boolean): string;
    /**
     * Uses <getCell>, <getStateToMark> and <intersects> to return the
     * <CellState> for the given {@link MouseEvent}.
     */
    getState(me: InternalMouseEvent): CellState | null;
    /**
     * Returns the <Cell> for the given event and cell. This returns the
     * given cell.
     */
    getCell(me: InternalMouseEvent): Cell | null;
    /**
     * Returns the <CellState> to be marked for the given <CellState> under
     * the mouse. This returns the given state.
     */
    getStateToMark(state: CellState | null): CellState | null;
    /**
     * Returns true if the given coordinate pair intersects the given state.
     * This returns true if the <hotspot> is 0 or the coordinates are inside
     * the hotspot for the given cell state.
     */
    intersects(state: CellState, me: InternalMouseEvent): boolean;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    destroy(): void;
}
export default CellMarker;
