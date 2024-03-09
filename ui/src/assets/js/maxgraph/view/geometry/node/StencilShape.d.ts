import ConnectionConstraint from '../../other/ConnectionConstraint';
import Rectangle from '../Rectangle';
import Shape from '../Shape';
import AbstractCanvas2D from '../../canvas/AbstractCanvas2D';
/**
 * Implements a generic shape which is based on a XML node as a description.
 *
 * @class StencilShape
 */
declare class StencilShape extends Shape {
    constructor(desc: Element);
    /**
     * Static global variable that specifies the default value for the localized
     * attribute of the text element. Default is false.
     */
    static defaultLocalized: boolean;
    /**
     * Static global switch that specifies if the use of eval is allowed for
     * evaluating text content and images. Default is false. Set this to true
     * if stencils can not contain user input.
     */
    static allowEval: boolean;
    /**
     * Holds the XML node with the stencil description.
     */
    desc: Element;
    /**
     * Holds an array of {@link ConnectionConstraints} as defined in the shape.
     */
    constraints: ConnectionConstraint[];
    /**
     * Holds the aspect of the shape. Default is 'auto'.
     */
    aspect: string;
    /**
     * Holds the width of the shape. Default is 100.
     */
    w0: number;
    /**
     * Holds the height of the shape. Default is 100.
     */
    h0: number;
    /**
     * Holds the XML node with the stencil description.
     */
    bgNode: Element | null;
    /**
     * Holds the XML node with the stencil description.
     */
    fgNode: Element | null;
    /**
     * Holds the strokewidth direction from the description.
     */
    strokeWidthValue: string | null;
    /**
     * Reads <w0>, <h0>, <aspect>, <bgNodes> and <fgNodes> from <desc>.
     */
    parseDescription(): void;
    /**
     * Reads the constraints from <desc> into <constraints> using
     * <parseConstraint>.
     */
    parseConstraints(): void;
    /**
     * Parses the given XML node and returns its {@link ConnectionConstraint}.
     */
    parseConstraint(node: Element): ConnectionConstraint;
    /**
     * Gets the given attribute as a text. The return value from <evaluateAttribute>
     * is used as a key to {@link Resources#get} if the localized attribute in the text
     * node is 1 or if <defaultLocalized> is true.
     */
    evaluateTextAttribute(node: Element, attribute: string, shape: Shape): string | null;
    /**
     * Gets the attribute for the given name from the given node. If the attribute
     * does not exist then the text content of the node is evaluated and if it is
     * a function it is invoked with <shape> as the only argument and the return
     * value is used as the attribute value to be returned.
     */
    evaluateAttribute(node: Element, attribute: string, shape: Shape): string | null;
    /**
     * Draws this stencil inside the given bounds.
     */
    drawShape(canvas: AbstractCanvas2D, shape: Shape, x: number, y: number, w: number, h: number): void;
    /**
     * Draws this stencil inside the given bounds.
     */
    drawChildren(canvas: AbstractCanvas2D, shape: Shape, x: number, y: number, w: number, h: number, node: Element | null, aspect: Rectangle, disableShadow: boolean, paint: boolean): void;
    /**
     * Returns a rectangle that contains the offset in x and y and the horizontal
     * and vertical scale in width and height used to draw this shape inside the
     * given {@link Rectangle}.
     *
     * @param shape {@link Shape} to be drawn.
     * @param bounds {@link Rectangle} that should contain the stencil.
     * @param direction Optional direction of the shape to be darwn.
     */
    computeAspect(shape: Shape | null | undefined, x: number, y: number, w: number, h: number, direction?: string): Rectangle;
    /**
     * Draws this stencil inside the given bounds.
     */
    drawNode(canvas: AbstractCanvas2D, shape: Shape, node: Element, aspect: Rectangle, disableShadow: boolean, paint: boolean): void;
}
export default StencilShape;
