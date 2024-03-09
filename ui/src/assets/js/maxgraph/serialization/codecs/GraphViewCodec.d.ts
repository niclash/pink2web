import ObjectCodec from '../ObjectCodec';
import GraphView from '../../view/GraphView';
import Cell from '../../view/cell/Cell';
/**
 * Custom encoder for {@link GraphView}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * This codec only writes views into an XML format that can be used to create an image for the graph, that is,
 * it contains absolute coordinates with computed perimeters, edge styles and cell styles.
 */
export declare class GraphViewCodec extends ObjectCodec {
    constructor();
    /**
     * Encodes the given {@link GraphView} using {@link encodeCell} starting at the model's root. This returns the
     * top-level graph node of the recursive encoding.
     */
    encode(enc: any, view: GraphView): any;
    /**
     * Recursively encodes the specified cell.
     *
     * Uses layer as the default node name. If the cell's parent is null, then graph is used for the node name.
     * If {@link Cell.isEdge} returns `true` for the cell, then edge is used for the node name, else if {@link Cell.isVertex} returns `true` for the cell,
     * then vertex is used for the node name.
     *
     * {@link Graph.getLabel} is used to create the label attribute for the cell.
     * For graph nodes and vertices the bounds are encoded into x, y, width and height.
     * For edges the points are encoded into a points attribute as a space-separated list of comma-separated coordinate pairs (e.g. x0,y0 x1,y1 ... xn,yn).
     * All values from the cell style are added as attribute values to the node.
     */
    encodeCell(enc: any, view: GraphView, cell: Cell): any;
}
