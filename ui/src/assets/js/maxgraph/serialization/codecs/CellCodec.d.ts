import ObjectCodec from '../ObjectCodec';
import Cell from '../../view/cell/Cell';
import type Codec from '../Codec';
/**
 * Codec for {@link Cell}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * Transient Fields:
 *
 * - children
 * - edges
 * - overlays
 * - mxTransient
 *
 * Reference Fields:
 *
 * - parent
 * - source
 * - target
 *
 * Transient fields can be added using the following code: `CodecRegistry.getCodec(Cell).exclude.push('name_of_field');`
 *
 * To subclass {@link Cell}, replace the template and add an alias as follows:
 *
 * ```javascript
 * // Given 'CustomCell' extends 'Cell'
 * CodecRegistry.getCodec(Cell).template = new CustomCell();
 * CodecRegistry.addAlias('CustomCell', 'Cell');
 * ```
 */
export declare class CellCodec extends ObjectCodec {
    constructor();
    /**
     * Returns `true` since this is a cell codec.
     */
    isCellCodec(): boolean;
    /**
     * Overridden to disable conversion of value to number.
     */
    isNumericAttribute(dec: Codec, attr: Element, obj: any): boolean;
    /**
     * Excludes user objects that are XML nodes.
     */
    isExcluded(obj: any, attr: string, value: Element, isWrite: boolean): boolean;
    /**
     * Encodes a {@link Cell} and wraps the XML up inside the XML of the user object (inversion).
     */
    afterEncode(enc: Codec, obj: Cell, node: Element): Element;
    /**
     * Decodes an {@link Cell} and uses the enclosing XML node as the user object for the cell (inversion).
     */
    beforeDecode(dec: Codec, node: Element, obj: Cell): Element | null;
}
