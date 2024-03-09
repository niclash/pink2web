import ObjectCodec from '../ObjectCodec';
import type Codec from '../Codec';
/**
 * Codec for {@link TerminalChange}s.
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
 * - terminal
 */
export declare class TerminalChangeCodec extends ObjectCodec {
    constructor();
    /**
     * Restores the state by assigning the previous value.
     */
    afterDecode(_dec: Codec, _node: Element, obj: any): any;
}
