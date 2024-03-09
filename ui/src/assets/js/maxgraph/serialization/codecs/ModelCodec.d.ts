import ObjectCodec from '../ObjectCodec';
import GraphDataModel from '../../view/GraphDataModel';
import Cell from '../../view/cell/Cell';
import type Codec from '../Codec';
/**
 * Codec for {@link GraphDataModel}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 */
export declare class ModelCodec extends ObjectCodec {
    constructor();
    /**
     * Encodes the given {@link GraphDataModel} by writing a (flat) XML sequence of cell nodes as produced by the {@link CellCodec}.
     * The sequence is wrapped-up in a node with the name `root`.
     */
    encodeObject(enc: any, obj: Cell, node: Element): void;
    /**
     * Overrides decode child to handle special child nodes.
     */
    decodeChild(dec: Codec, child: Element, obj: Cell | GraphDataModel): void;
    /**
     * Reads the cells into the graph model. All cells are children of the root element in the node.
     */
    decodeRoot(dec: Codec, root: Element, model: GraphDataModel): void;
}
