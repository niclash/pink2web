/*
Copyright 2021-present The maxGraph project Contributors
Copyright (c) 2006-2015, JGraph Ltd
Copyright (c) 2006-2015, Gaudenz Alder

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import Point from '../geometry/Point';
import Rectangle from '../geometry/Rectangle';
import Dictionary from '../../util/Dictionary';
import { ALIGN, NONE } from '../../util/Constants';
/**
 * Represents the current state of a cell in a given {@link GraphView}.
 *
 * For edges, the edge label position is stored in <absoluteOffset>.
 *
 * The size for oversize labels can be retrieved using the boundingBox property
 * of the <text> field as shown below.
 *
 * ```javascript
 * let bbox = (state.text != null) ? state.text.boundingBox : null;
 * ```
 *
 */
class CellState extends Rectangle {
    /**
     * Constructs a new object that represents the current state of the given Cell in the specified view.
     *
     * @param view {@link GraphView} that contains the state.
     * @param cell {@link Cell} that this state represents.
     * @param style the style of the Cell.
     */
    constructor(view = null, cell = null, style = null) {
        super();
        // referenced in mxCellRenderer
        this.node = null;
        // TODO: Document me!!
        this.cellBounds = null;
        this.paintBounds = null;
        this.boundingBox = null;
        // Used by mxCellRenderer's createControl()
        this.control = null;
        // Used by mxCellRenderer's createCellOverlays()
        this.overlays = new Dictionary();
        /**
         * Specifies if the style is invalid. Default is false.
         */
        this.invalidStyle = false;
        /**
         * Specifies if the state is invalid. Default is true.
         */
        this.invalid = true;
        /**
         * Holds an array of <Point> that represent the absolute points of an
         * edge.
         */
        this.absolutePoints = [];
        /**
         * Caches the visible source terminal state.
         */
        this.visibleSourceState = null;
        /**
         * Caches the visible target terminal state.
         */
        this.visibleTargetState = null;
        /**
         * Caches the distance between the end points for an edge.
         */
        this.terminalDistance = 0;
        /**
         * Caches the length of an edge.
         */
        this.length = 0;
        /**
         * Array of numbers that represent the cached length of each segment of the
         * edge.
         */
        this.segments = [];
        /**
         * Holds the {@link Shape} that represents the cell graphically.
         */
        this.shape = null;
        /**
         * Holds the {@link Text} that represents the label of the cell. Thi smay be
         * null if the cell has no label.
         */
        this.text = null;
        /**
         * Holds the unscaled width of the state.
         */
        this.unscaledWidth = 0;
        /**
         * Holds the unscaled height of the state.
         */
        this.unscaledHeight = 0;
        this.parentHighlight = null;
        this.point = null;
        if (view) {
            this.view = view;
        }
        if (cell) {
            this.cell = cell;
        }
        this.style = style ?? {};
        this.origin = new Point();
        this.absoluteOffset = new Point();
    }
    /**
     * Returns the {@link Rectangle} that should be used as the perimeter of the
     * cell.
     *
     * @param border Optional border to be added around the perimeter bounds.
     * @param bounds Optional {@link Rectangle} to be used as the initial bounds.
     */
    getPerimeterBounds(border = 0, bounds = new Rectangle(this.x, this.y, this.width, this.height)) {
        if (this.shape?.stencil?.aspect === 'fixed') {
            const aspect = this.shape.stencil.computeAspect(this.shape, bounds.x, bounds.y, bounds.width, bounds.height);
            bounds.x = aspect.x;
            bounds.y = aspect.y;
            bounds.width = this.shape.stencil.w0 * aspect.width;
            bounds.height = this.shape.stencil.h0 * aspect.height;
        }
        if (border !== 0) {
            bounds.grow(border);
        }
        return bounds;
    }
    /**
     * Sets the first or last point in <absolutePoints> depending on isSource.
     *
     * @param point {@link Point} that represents the terminal point.
     * @param isSource Boolean that specifies if the first or last point should
     * be assigned.
     */
    setAbsoluteTerminalPoint(point, isSource = false) {
        if (isSource) {
            if (this.absolutePoints.length === 0) {
                this.absolutePoints.push(point);
            }
            else {
                this.absolutePoints[0] = point;
            }
        }
        else if (this.absolutePoints.length === 0) {
            this.absolutePoints.push(null);
            this.absolutePoints.push(point);
        }
        else if (this.absolutePoints.length === 1) {
            this.absolutePoints.push(point);
        }
        else {
            this.absolutePoints[this.absolutePoints.length - 1] = point;
        }
    }
    /**
     * Sets the given cursor on the shape and text shape.
     */
    setCursor(cursor) {
        if (this.shape) {
            this.shape.setCursor(cursor);
        }
        if (this.text) {
            this.text.setCursor(cursor);
        }
    }
    /**
     * Returns the visible source or target terminal cell.
     *
     * @param source Boolean that specifies if the source or target cell should be
     * returned.
     */
    getVisibleTerminal(source = false) {
        return this.getVisibleTerminalState(source)?.cell ?? null;
    }
    /**
     * Returns the visible source or target terminal state.
     *
     * @param source Boolean that specifies if the source or target state should be
     * returned.
     */
    getVisibleTerminalState(source = false) {
        return source ? this.visibleSourceState : this.visibleTargetState;
    }
    /**
     * Sets the visible source or target terminal state.
     *
     * @param terminalState <CellState> that represents the terminal.
     * @param source Boolean that specifies if the source or target state should be set.
     */
    setVisibleTerminalState(terminalState, source = false) {
        if (source) {
            this.visibleSourceState = terminalState;
        }
        else {
            this.visibleTargetState = terminalState;
        }
    }
    /**
     * Returns the unscaled, untranslated bounds.
     */
    getCellBounds() {
        return this.cellBounds;
    }
    /**
     * Returns the unscaled, untranslated paint bounds. This is the same as
     * <getCellBounds> but with a 90 degree rotation if the shape's
     * isPaintBoundsInverted returns true.
     */
    getPaintBounds() {
        return this.paintBounds;
    }
    /**
     * Updates the cellBounds and paintBounds.
     */
    updateCachedBounds() {
        const view = this.view;
        const tr = view.translate;
        const s = view.scale;
        this.cellBounds = new Rectangle(this.x / s - tr.x, this.y / s - tr.y, this.width / s, this.height / s);
        this.paintBounds = Rectangle.fromRectangle(this.cellBounds);
        if (this.shape && this.shape.isPaintBoundsInverted()) {
            this.paintBounds.rotate90();
        }
    }
    /**
     * Destructor: setState
     *
     * Copies all fields from the given state to this state.
     */
    setState(state) {
        this.view = state.view;
        this.cell = state.cell;
        this.style = state.style;
        this.absolutePoints = state.absolutePoints;
        this.origin = state.origin;
        this.absoluteOffset = state.absoluteOffset;
        this.boundingBox = state.boundingBox;
        this.terminalDistance = state.terminalDistance;
        this.segments = state.segments;
        this.length = state.length;
        this.x = state.x;
        this.y = state.y;
        this.width = state.width;
        this.height = state.height;
        this.unscaledWidth = state.unscaledWidth;
        this.unscaledHeight = state.unscaledHeight;
    }
    /**
     * Returns a clone of this {@link Point}.
     */
    clone() {
        const clone = new CellState(this.view, this.cell, this.style);
        // Clones the absolute points
        for (let i = 0; i < this.absolutePoints.length; i += 1) {
            const p = this.absolutePoints[i];
            clone.absolutePoints[i] = p ? p.clone() : null;
        }
        if (this.origin) {
            clone.origin = this.origin.clone();
        }
        if (this.absoluteOffset) {
            clone.absoluteOffset = this.absoluteOffset.clone();
        }
        if (this.boundingBox) {
            clone.boundingBox = this.boundingBox.clone();
        }
        clone.terminalDistance = this.terminalDistance;
        clone.segments = this.segments;
        clone.length = this.length;
        clone.x = this.x;
        clone.y = this.y;
        clone.width = this.width;
        clone.height = this.height;
        clone.unscaledWidth = this.unscaledWidth;
        clone.unscaledHeight = this.unscaledHeight;
        return clone;
    }
    /**
     * Destructor: destroy
     *
     * Destroys the state and all associated resources.
     */
    destroy() {
        this.view.graph.cellRenderer.destroy(this);
    }
    /**
     * Returns true if the given cell state is a loop.
     *
     * @param state {@link CellState} that represents a potential loop.
     */
    isLoop(state) {
        const src = this.getVisibleTerminalState(true);
        return src && src === this.getVisibleTerminalState(false);
    }
    /*****************************************************************************
     * Group: Graph appearance
     *****************************************************************************/
    /**
     * Returns the vertical alignment for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.verticalAlign}
     * property of {@link style}.
     */
    getVerticalAlign() {
        return this.style.verticalAlign ?? ALIGN.MIDDLE;
    }
    /**
     * Returns `true` if the given state has no stroke, no fill color and no image.
     */
    isTransparentState() {
        return ((this.style.strokeColor ?? NONE) === NONE &&
            (this.style.fillColor ?? NONE) === NONE &&
            !this.getImageSrc());
    }
    /**
     * Returns the image URL for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.image} property
     * of {@link style}.
     */
    getImageSrc() {
        return this.style.image || null;
    }
    /**
     * Returns the indicator color for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.indicatorColor}
     * property of {@link style}.
     */
    getIndicatorColor() {
        return this.style.indicatorColor || null;
    }
    /**
     * Returns the indicator gradient color for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.gradientColor}
     * property of {@link style}.
     */
    getIndicatorGradientColor() {
        return this.style.gradientColor || null;
    }
    /**
     * Returns the indicator shape for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.indicatorShape}
     * property of {@link style}.
     */
    getIndicatorShape() {
        return this.style.indicatorShape || null;
    }
    /**
     * Returns the indicator image for the given cell state.
     * This implementation returns the value stored in the {@link CellStateStyle.indicatorImage}
     * property of {@link style}.
     */
    getIndicatorImageSrc() {
        return this.style.indicatorImage || null;
    }
}
export default CellState;
