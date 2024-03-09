import type { CellStateStyle, CellStyle } from '../../types';
/**
 * Defines the appearance of the cells in a graph. See {@link putCellStyle} for an example
 * of creating a new cell style.
 *
 * Existing styles can be cloned using {@link clone} and turned into a string for debugging
 * using {@link toString}.
 *
 * ### Default Styles
 *
 * The stylesheet contains two built-in styles, which are used if no style is defined for
 * a cell:
 *
 * - `defaultVertex`: default style for vertices
 * - `defaultEdge`: default style for edges
 *
 * ### Example
 *
 * ```javascript
 * const defaultVertexStyle = stylesheet.getDefaultVertexStyle();
 * defaultVertexStyle.rounded = true;
 * const defaultEdgeStyle = stylesheet.getDefaultEdgeStyle();
 * defaultEdgeStyle.edgeStyle = EdgeStyle.EntityRelation;
 * ```
 */
export declare class Stylesheet {
    constructor();
    /**
     * Maps from names to cell styles. Each cell style is a map of key,
     * value pairs.
     */
    styles: Map<string, CellStateStyle>;
    /**
     * Creates and returns the default vertex style.
     */
    createDefaultVertexStyle(): CellStateStyle;
    /**
     * Creates and returns the default edge style.
     */
    createDefaultEdgeStyle(): CellStateStyle;
    /**
     * Sets the default style for vertices using `defaultVertex` as the style name.
     * @param style The style to be stored.
     */
    putDefaultVertexStyle(style: CellStateStyle): void;
    /**
     * Sets the default style for edges using `defaultEdge` as the style name.
     * @param style The style to be stored.
     */
    putDefaultEdgeStyle(style: CellStateStyle): void;
    /**
     * Returns the default style for vertices.
     */
    getDefaultVertexStyle(): CellStateStyle;
    /**
     * Returns the default style for edges.
     */
    getDefaultEdgeStyle(): CellStateStyle;
    /**
     * Stores the given {@link CellStateStyle} under the given name in {@link styles}.
     *
     * ### Example
     *
     * The following example adds a new style called `rounded` into an existing stylesheet:
     *
     * ```javascript
     * const style = {} as CellStateStyle;
     * style.shape = SHAPE.RECTANGLE;
     * style.perimeter = PERIMETER.RECTANGLE;
     * style.rounded = true;
     * graph.getStylesheet().putCellStyle('rounded', style);
     * ```
     *
     * ### Description
     *
     * Note that not all properties will be interpreted by all shapes. For example, the 'line' shape ignores the fill color.
     * The final call to this method associates the style with a name in the stylesheet.
     *
     * The style is used in a cell with the following code:
     * ```javascript
     * // model is an instance of GraphDataModel
     * // style is an instance of CellStyle
     * model.setStyle(cell, { baseStyleNames: ['rounded'] });
     * ```
     *
     * @param name Name for the style to be stored.
     * @param style The instance of the style to be stored.
     */
    putCellStyle(name: string, style: CellStateStyle): void;
    /**
     * Returns a {@link CellStateStyle} computed by merging the default style, styles referenced in the specified `baseStyleNames`
     * and the properties of the `cellStyle` parameter.
     *
     * The properties are merged by taken the properties from various styles in the following order:
     *   - default style
     *   - registered styles referenced in `baseStyleNames`, in the order of the array
     *   - `cellStyle` parameter
     *
     * @param cellStyle An object that represents the style.
     * @param defaultStyle Default style used as reference to compute the returned style.
     */
    getCellStyle(cellStyle: CellStyle, defaultStyle: CellStateStyle): CellStateStyle;
}
