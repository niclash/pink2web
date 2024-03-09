import ObjectCodec from '../../ObjectCodec';
import type Codec from '../../Codec';
/**
 * Custom codec for configuring {@link EditorKeyHandler}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * This codec only reads configuration data for existing key handlers, it does not encode or create key handlers.
 */
export declare class EditorKeyHandlerCodec extends ObjectCodec {
    constructor();
    /**
     * Returns `null`.
     */
    encode(enc: Codec, obj: any): null;
    /**
     * Reads a sequence of the following child nodes and attributes:
     *
     * Child Nodes:
     *
     * add - Binds a keystroke to an action name.
     *
     * Attributes:
     *
     * as - Keycode.
     * action - Action name to execute in editor.
     * control - Optional boolean indicating if
     *     the control key must be pressed.
     *
     * Example:
     *
     * ```javascript
     * <EditorKeyHandler as="keyHandler">
     *   <add as="88" control="true" action="cut"/>
     *   <add as="67" control="true" action="copy"/>
     *   <add as="86" control="true" action="paste"/>
     * </EditorKeyHandler>
     * ```
     *
     * The keycodes are for the x, c and v keys.
     *
     * See also: <EditorKeyHandler.bindAction>, http://www.js-examples.com/page/tutorials__key_codes.html
     */
    decode(dec: Codec, _node: Element, into: any): any;
}
