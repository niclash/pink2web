/**
 * A singleton class that provides cross-browser helper methods.
 * This is a global functionality. To access the functions in this
 * class, use the global classname appended by the functionname.
 * You may have to load chrome://global/content/contentAreaUtils.js
 * to disable certain security restrictions in Mozilla for the <open>,
 * <save>, <saveAs> and <copy> function.
 *
 * For example, the following code displays an error message:
 *
 * ```javascript
 * mxUtils.error('Browser is not supported!', 200, false);
 * ```
 */
export declare const utils: {
    errorResource: string;
    /**
     * Specifies the resource key for the label of the close button. If the
     * resource for this key does not exist then the value is used as
     * the label. Default is 'close'.
     */
    closeResource: string;
    /**
     * Defines the image used for error dialogs.
     */
    errorImage: string;
};
export declare const isNullish: (v: string | object | null | undefined | number) => boolean;
export declare const isNotNullish: (v: string | object | null | undefined | number) => boolean;
export declare const mixInto: (dest: any) => (mixin: any) => void;
/**
 * Returns the value for the given key in the given associative array or
 * the given default value if the value is null.
 *
 * @param array Associative array that contains the value for the key.
 * @param key Key whose value should be returned.
 * @param defaultValue Value to be returned if the value for the given
 * key is null.
 */
export declare const getValue: (array: any, key: string, defaultValue?: any) => any;
export declare const copyTextToClipboard: (text: string) => void;
