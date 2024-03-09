import Point from './Point';
/**
 * Extends {@link Point} to implement a 2-dimensional rectangle with double
 * precision coordinates.
 *
 * Constructor: mxRectangle
 *
 * Constructs a new rectangle for the optional parameters. If no parameters
 * are given then the respective default values are used.
 */
declare class Rectangle extends Point {
    constructor(x?: number, y?: number, width?: number, height?: number);
    /**
     * Holds the width of the rectangle. Default is 0.
     */
    _width: number;
    /**
     * Holds the height of the rectangle. Default is 0.
     */
    _height: number;
    get width(): number;
    set width(width: number);
    get height(): number;
    set height(height: number);
    /**
     * Returns a new {@link Rectangle} which is a copy of the given rectangle.
     */
    static fromRectangle: (rect: Rectangle) => Rectangle;
    /**
     * Sets this rectangle to the specified values
     */
    setRect(x: number, y: number, width: number, height: number): void;
    /**
     * Returns the x-coordinate of the center point.
     */
    getCenterX(): number;
    /**
     * Returns the y-coordinate of the center point.
     */
    getCenterY(): number;
    /**
     * Adds the given rectangle to this rectangle.
     */
    add(rect: Rectangle): void;
    /**
     * Changes this rectangle to where it overlaps with the given rectangle.
     */
    intersect(rect: Rectangle): void;
    /**
     * Grows the rectangle by the given amount, that is, this method subtracts
     * the given amount from the x- and y-coordinates and adds twice the amount
     * to the width and height.
     */
    grow(amount: number): void;
    /**
     * Returns the top, left corner as a new {@link Point}.
     */
    getPoint(): Point;
    /**
     * Rotates this rectangle by 90 degree around its center point.
     */
    rotate90(): void;
    /**
     * Returns true if the given object equals this rectangle.
     */
    equals(rect: Rectangle | null): boolean;
    clone(): Rectangle;
}
export default Rectangle;
