import Shape from '../Shape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
import Point from '../Point';
import Rectangle from '../Rectangle';
import CellState from '../../cell/CellState';
import { ColorValue } from '../../../types';
/**
 * Extends {@link Shape} to implement an new rounded arrow shape with support for waypoints and double arrows. The
 * shape is used to represent edges, not vertices.
 *
 * This shape is registered under {@link mxConstants.SHAPE_ARROW_CONNECTOR} in {@link mxCellRenderer}.
 */
declare class ArrowConnectorShape extends Shape {
    constructor(points: Point[], fill: ColorValue, stroke: ColorValue, strokeWidth?: number, arrowWidth?: number, spacing?: number, endSize?: number);
    arrowWidth: number;
    arrowSpacing: number;
    /**
     * Allows to use the SVG bounding box in SVG.
     * @defaultValue `false` for performance reasons.
     */
    useSvgBoundingBox: boolean;
    /**
     * Hook for subclassers.
     */
    isRoundable(): boolean;
    /**
     * Overrides mxShape to reset spacing.
     */
    resetStyles(): void;
    /**
     * Overrides apply to get smooth transition from default start- and endsize.
     */
    apply(state: CellState): void;
    /**
     * Augments the bounding box with the edge width and markers.
     */
    augmentBoundingBox(bbox: Rectangle): void;
    /**
     * Paints the line shape.
     */
    paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void;
    /**
     * Paints the marker.
     */
    paintMarker(c: AbstractCanvas2D, ptX: number, ptY: number, nx: number, ny: number, size: number, arrowWidth: number, edgeWidth: number, spacing: number, initialMove: boolean): void;
    /**
     * @returns whether the arrow is rounded
     */
    isArrowRounded(): boolean;
    /**
     * @returns the width of the start arrow
     */
    getStartArrowWidth(): number;
    /**
     * @returns the width of the end arrow
     */
    getEndArrowWidth(): number;
    /**
     * @returns the width of the body of the edge
     */
    getEdgeWidth(): number;
    /**
     * @returns whether the ends of the shape are drawn
     */
    isOpenEnded(): boolean;
    /**
     * @returns whether the start marker is drawn
     */
    isMarkerStart(): boolean;
    /**
     * @returns whether the end marker is drawn
     */
    isMarkerEnd(): boolean;
}
export default ArrowConnectorShape;
