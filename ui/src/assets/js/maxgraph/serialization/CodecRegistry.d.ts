import ObjectCodec from './ObjectCodec';
/**
 * Singleton class that acts as a global registry for codecs.
 *
 * ### Adding a Codec
 *
 * 1. Define a default codec with a new instance of the object to be handled.
 *
 *     ```javascript
 *     const codec = new ObjectCodec(new Transactions());
 *     ```
 *
 * 2. Define the functions required for encoding and decoding objects.
 *
 *     ```javascript
 *     codec.encode = function(enc, obj) { ... }
 *     codec.decode = function(dec: Codec, node: Element, into: any): any { ... }
 *     ```
 *
 * 3. Register the codec in the CodecRegistry.
 *
 *     ```javascript
 *     CodecRegistry.register(codec);
 *     ```
 *
 * {@link ObjectCodec.decode} may be used to either create a new instance of an object or to configure an existing instance,
 * in which case the into argument points to the existing object. In this case, we say the codec "configures" the object.
 */
declare class CodecRegistry {
    static codecs: {
        [key: string]: ObjectCodec | undefined;
    };
    /**
     * Maps from classnames to codec names.
     */
    static aliases: {
        [key: string]: string | undefined;
    };
    /**
     * Registers a new codec and associates the name of the codec via {@link ObjectCodec.getName} with the codec object.
     *
     * @param codec ObjectCodec to be registered.
     * @param registerAlias if `true`, register an alias if the codec name doesn't match the name of the constructor of {@link ObjectCodec.template}.
     */
    static register(codec: ObjectCodec, registerAlias?: boolean): ObjectCodec;
    /**
     * Adds an alias for mapping a classname to a codec name.
     */
    static addAlias(classname: string, codecname: string): void;
    /**
     * Returns a codec that handles objects that are constructed using the given constructor or a codec registered under the provided name.
     *
     * When passing a name, the method first check if an alias exists for the name, and if so, it uses it to retrieve the codec.
     *
     * If there is no registered Codec, the method tries to register a new Codec using the provided constructor.
     *
     * @param constructorOrName JavaScript constructor function of the Codec or Codec name.
     */
    static getCodec(constructorOrName: any): ObjectCodec | null;
    /**
     * First try to get the codec by the name it is registered with. If it doesn't exist, use the alias eventually declared
     * to get the codec.
     * @param name the name of the codec that is willing to be retrieved.
     */
    static getCodecByName(name: string): ObjectCodec | null;
}
export default CodecRegistry;
