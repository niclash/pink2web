import ObjectCodec from '../ObjectCodec';
import type Codec from '../Codec';
/**
 * Codec for {@link RootChange}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * Transient Fields:
 *
 * - model
 * - previous
 * - root
 */
export declare class RootChangeCodec extends ObjectCodec {
    constructor();
    /**
     * Encodes the child recursively.
     */
    afterEncode(enc: Codec, obj: any, node: Element): Element;
    /**
     * Decodes the optional children as cells using the respective decoder.
     */
    beforeDecode(dec: Codec, node: Element, obj: any): any;
    /**
     * Restores the state by assigning the previous value.
     */
    afterDecode(_dec: Codec, _node: Element, obj: any): any;
}
