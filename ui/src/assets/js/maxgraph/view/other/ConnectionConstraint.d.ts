import Point from '../geometry/Point';
/**
 * Defines an object that contains the constraints about how to connect one side of an edge to its terminal.
 * @class ConnectionConstraint
 */
declare class ConnectionConstraint {
    /**
     * {@link Point} that specifies the fixed location of the connection point.
     */
    point: Point | null;
    /**
     * Boolean that specifies if the point should be projected onto the perimeter
     * of the terminal.
     */
    perimeter: boolean;
    /**
     * Optional string that specifies the name of the constraint.
     */
    name: string | null;
    /**
     * Optional float that specifies the horizontal offset of the constraint.
     */
    dx: number;
    /**
     * Optional float that specifies the vertical offset of the constraint.
     */
    dy: number;
    constructor(point: Point | null, perimeter?: boolean, name?: string | null, dx?: number, dy?: number);
}
export default ConnectionConstraint;
