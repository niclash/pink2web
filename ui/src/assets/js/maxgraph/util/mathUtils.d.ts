import Point from '../view/geometry/Point';
import Rectangle from '../view/geometry/Rectangle';
import CellState from '../view/cell/CellState';
import type { CellStateStyle } from '../types';
/**
 * Converts the given degree to radians.
 */
export declare const toRadians: (deg: number) => number;
/**
 * Converts the given radians to degree.
 */
export declare const toDegree: (rad: number) => number;
/**
 * Converts the given arc to a series of curves.
 */
export declare const arcToCurves: (x0: number, y0: number, r1: number, r2: number, angle: number, largeArcFlag: boolean, sweepFlag: boolean, x: number, y: number) => number[];
/**
 * Returns the bounding box for the rotated rectangle.
 *
 * @param rect {@link Rectangle} to be rotated.
 * @param angle Number that represents the angle (in degrees).
 * @param cx Optional {@link Point} that represents the rotation center. If no
 * rotation center is given then the center of rect is used.
 */
export declare const getBoundingBox: (rect: Rectangle | null, rotation: number, cx?: Point | null) => Rectangle | null;
/**
 * Rotates the given point by the given cos and sin.
 */
export declare const getRotatedPoint: (pt: Point, cos: number, sin: number, c?: Point) => Point;
/**
 * Returns an integer mask of the port constraints of the given map
 *
 * @param terminal {@link CelState} that represents the terminal.
 * @param edge {@link CelState} that represents the edge.
 * @param source Boolean that specifies if the terminal is the source terminal.
 * @param defaultValue Default value to be returned if no port constraint is defined in the terminal.
 * @return the mask of port constraint directions
 */
export declare const getPortConstraints: (terminal: CellState, edge: CellState, source: boolean, defaultValue: number) => number;
/**
 * Reverse the port constraint bitmask. For example, north | east
 * becomes south | west
 */
export declare const reversePortConstraints: (constraint: number) => number;
/**
 * Finds the index of the nearest segment on the given cell state for
 * the specified coordinate pair.
 */
export declare const findNearestSegment: (state: CellState, x: number, y: number) => number;
/**
 * Adds the given margins to the given rectangle and rotates and flips the
 * rectangle according to the respective styles in style.
 */
export declare const getDirectedBounds: (rect: Rectangle, m: Rectangle, style: CellStateStyle | null, flipH: boolean, flipV: boolean) => Rectangle;
/**
 * Returns the intersection between the polygon defined by the array of
 * points and the line between center and point.
 */
export declare const getPerimeterPoint: (pts: Point[], center: Point, point: Point) => Point | null;
/**
 * Returns true if the given rectangle intersects the given segment.
 *
 * @param bounds {@link Rectangle} that represents the rectangle.
 * @param p1 {@link Point} that represents the first point of the segment.
 * @param p2 {@link Point} that represents the second point of the segment.
 */
export declare const rectangleIntersectsSegment: (bounds: Rectangle, p1: Point, p2: Point) => boolean;
/**
 * Returns true if the specified point (x, y) is contained in the given rectangle.
 *
 * @param bounds {@link Rectangle} that represents the area.
 * @param x X-coordinate of the point.
 * @param y Y-coordinate of the point.
 */
export declare const contains: (bounds: Rectangle, x: number, y: number) => boolean;
/**
 * Returns true if the two rectangles intersect.
 *
 * @param a {@link Rectangle} to be checked for intersection.
 * @param b {@link Rectangle} to be checked for intersection.
 */
export declare const intersects: (a: Rectangle, b: Rectangle) => boolean;
/**
 * Returns true if the state and the hotspot intersect.
 *
 * @param state <CellState>
 * @param x X-coordinate.
 * @param y Y-coordinate.
 * @param hotspot Optional size of the hostpot.
 * @param min Optional min size of the hostpot.
 * @param max Optional max size of the hostpot.
 */
export declare const intersectsHotspot: (state: CellState, x: number, y: number, hotspot: number, min: number, max: number) => boolean;
/**
 * Returns true if the specified value is numeric, that is, if it is not
 * null, not an empty string, not a HEX number and isNaN returns false.
 *
 * @param n String representing the possibly numeric value.
 */
export declare const isNumeric: (n: any) => boolean;
/**
 * Returns true if the given value is an valid integer number.
 *
 * @param n String representing the possibly numeric value.
 */
export declare const isInteger: (n: string) => boolean;
/**
 * Returns the remainder of division of n by m. You should use this instead
 * of the built-in operation as the built-in operation does not properly
 * handle negative numbers.
 */
export declare const mod: (n: number, m: number) => number;
/**
 * Returns the intersection of two lines as an {@link Point}.
 *
 * @param x0 X-coordinate of the first line's startpoint.
 * @param y0 X-coordinate of the first line's startpoint.
 * @param x1 X-coordinate of the first line's endpoint.
 * @param y1 Y-coordinate of the first line's endpoint.
 * @param x2 X-coordinate of the second line's startpoint.
 * @param y2 Y-coordinate of the second line's startpoint.
 * @param x3 X-coordinate of the second line's endpoint.
 * @param y3 Y-coordinate of the second line's endpoint.
 */
export declare const intersection: (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => Point | null;
/**
 * Returns the square distance between a segment and a point. To get the
 * distance between a point and a line (with infinite length) use
 * {@link Utils#ptLineDist}.
 *
 * @param x1 X-coordinate of the startpoint of the segment.
 * @param y1 Y-coordinate of the startpoint of the segment.
 * @param x2 X-coordinate of the endpoint of the segment.
 * @param y2 Y-coordinate of the endpoint of the segment.
 * @param px X-coordinate of the point.
 * @param py Y-coordinate of the point.
 */
export declare const ptSegDistSq: (x1: number, y1: number, x2: number, y2: number, px: number, py: number) => number;
/**
 * Returns the distance between a line defined by two points and a point.
 * To get the distance between a point and a segment (with a specific
 * length) use {@link Utils#ptSeqDistSq}.
 *
 * @param x1 X-coordinate of point 1 of the line.
 * @param y1 Y-coordinate of point 1 of the line.
 * @param x2 X-coordinate of point 1 of the line.
 * @param y2 Y-coordinate of point 1 of the line.
 * @param px X-coordinate of the point.
 * @param py Y-coordinate of the point.
 */
export declare const ptLineDist: (x1: number, y1: number, x2: number, y2: number, px: number, py: number) => number;
/**
 * Returns 1 if the given point on the right side of the segment, 0 if its
 * on the segment, and -1 if the point is on the left side of the segment.
 *
 * @param x1 X-coordinate of the startpoint of the segment.
 * @param y1 Y-coordinate of the startpoint of the segment.
 * @param x2 X-coordinate of the endpoint of the segment.
 * @param y2 Y-coordinate of the endpoint of the segment.
 * @param px X-coordinate of the point.
 * @param py Y-coordinate of the point.
 */
export declare const relativeCcw: (x1: number, y1: number, x2: number, y2: number, px: number, py: number) => 0 | 1 | -1;
