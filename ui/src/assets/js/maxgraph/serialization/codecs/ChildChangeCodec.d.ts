import ObjectCodec from '../ObjectCodec';
import type Codec from '../Codec';
/**
 * Codec for {@link ChildChange}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * Transient Fields:
 *
 * - model
 * - previous
 * - previousIndex
 * - child
 *
 * Reference Fields:
 *
 * - parent
 */
export declare class ChildChangeCodec extends ObjectCodec {
    constructor();
    /**
     * Returns `true` for the child attribute if the child cell had a previous parent or if we're reading the
     * child as an attribute rather than a child node, in which case it's always a reference.
     */
    isReference(obj: any, attr: string, value: any, isWrite: boolean): boolean;
    /**
     * Excludes references to parent or previous if not in the model.
     */
    isExcluded(obj: any, attr: string, value: any, write: boolean): boolean;
    /**
     * Encodes the child recursively and adds the result to the given node.
     */
    afterEncode(enc: Codec, obj: any, node: Element): Element;
    /**
     * Decodes any child nodes as using the respective codec from the registry.
     */
    beforeDecode(dec: Codec, _node: Element, obj: any): any;
    /**
     * Restores object state in the child change.
     */
    afterDecode(dec: Codec, node: Element, obj: any): any;
}
