import ObjectCodec from '../ObjectCodec';
import type Codec from '../Codec';
/**
 * Codec for {@link ValueChange}s, {@link StyleChange}s, {@link GeometryChange}s, {@link CollapseChange}s and {@link VisibleChange}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * Transient Fields:
 *
 * - model
 * - previous
 *
 * Reference Fields:
 *
 * - cell
 */
export declare class GenericChangeCodec extends ObjectCodec {
    /**
     *
     * @param obj An instance of the change object.
     * @param variable The field name for the change data.
     */
    constructor(obj: any, variable: string);
    variable: string;
    /**
     * Restores the state by assigning the previous value.
     */
    afterDecode(dec: Codec, _node: Element, obj: any): any;
}
