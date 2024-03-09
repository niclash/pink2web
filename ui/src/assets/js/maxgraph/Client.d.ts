declare class Client {
    /**
     * The version of the `maxGraph` library.
     */
    static VERSION: string;
    /**
     * Base path for all URLs in the core without trailing slash.
     *
     * When using a relative path, the path is relative to the URL of the page that contains the assignment. Trailing slashes are automatically removed.
     * @default '.'
     */
    static basePath: string;
    static setBasePath: (value: string) => void;
    /**
     * Base path for all images URLs in the core without trailing slash.
     *
     * When using a relative path, the path is relative to the URL of the page that
     * contains the assignment. Trailing slashes are automatically removed.
     * @default '.'
     */
    static imageBasePath: string;
    static setImageBasePath: (value: string) => void;
    /**
     * Defines the language of the client, eg. `en` for english, `de` for german etc.
     * The special value `none` will disable all built-in internationalization and
     * resource loading. See {@link Resources#getSpecialBundle} for handling identifiers
     * with and without a dash.
     *
     * If internationalization is disabled, then the following variables should be
     * overridden to reflect the current language of the system. These variables are
     * cleared when i18n is disabled.
     * {@link Editor.askZoomResource}, {@link Editor.lastSavedResource},
     * {@link Editor.currentFileResource}, {@link Editor.propertiesResource},
     * {@link Editor.tasksResource}, {@link Editor.helpResource}, {@link Editor.outlineResource},
     * {@link ElbowEdgeHandler#doubleClickOrientationResource}, {@link Utils#errorResource},
     * {@link Utils#closeResource}, {@link GraphSelectionModel#doneResource},
     * {@link GraphSelectionModel#updatingSelectionResource}, {@link GraphView#doneResource},
     * {@link GraphView#updatingDocumentResource}, {@link CellRenderer#collapseExpandResource},
     * {@link Graph#containsValidationErrorsResource} and
     * {@link Graph#alreadyConnectedResource}.
     */
    static language: string;
    static setLanguage: (value: string | undefined | null) => void;
    /**
     * Defines the default language which is used in the common resource files. Any
     * resources for this language will only load the common resource file, but not
     * the language-specific resource file.
     * @default 'en'
     */
    static defaultLanguage: string;
    static setDefaultLanguage: (value: string | undefined | null) => void;
    /**
     * Defines the optional array of all supported language extensions. The default
     * language does not have to be part of this list. See
     * {@link Translations#isLanguageSupported}.
     *
     * This is used to avoid unnecessary requests to language files, ie. if a 404
     * will be returned.
     * @default null
     */
    static languages: string[] | null;
    static setLanguages: (value: string[] | null | undefined) => void;
    /**
     * True if the current browser is Microsoft Edge.
     */
    static IS_EDGE: boolean;
    /**
     * True if the current browser is Netscape (including Firefox).
     */
    static IS_NS: boolean;
    /**
     * True if the current browser is Safari.
     */
    static IS_SF: boolean;
    /**
     * Returns true if the user agent contains Android.
     */
    static IS_ANDROID: boolean;
    /**
     * Returns true if the user agent is an iPad, iPhone or iPod.
     */
    static IS_IOS: boolean;
    /**
     * True if the current browser is Google Chrome.
     */
    static IS_GC: boolean;
    /**
     * True if the this is running inside a Chrome App.
     */
    static IS_CHROMEAPP: boolean;
    /**
     * True if the current browser is Firefox.
     */
    static IS_FF: boolean;
    /**
     * True if -moz-transform is available as a CSS style. This is the case
     * for all Firefox-based browsers newer than or equal 3, such as Camino,
     * Iceweasel, Seamonkey and Iceape.
     */
    static IS_MT: boolean;
    /**
     * True if the browser supports SVG.
     */
    static IS_SVG: boolean;
    /**
     * True if foreignObject support is not available. This is the case for
     * Opera, older SVG-based browsers and all versions of IE.
     */
    static NO_FO: boolean;
    /**
     * True if the client is a Windows.
     */
    static IS_WIN: boolean;
    /**
     * True if the client is a Mac.
     */
    static IS_MAC: boolean;
    /**
     * True if the client is a Chrome OS.
     */
    static IS_CHROMEOS: boolean;
    /**
     * True if this device supports touchstart/-move/-end events (Apple iOS,
     * Android, Chromebook and Chrome Browser on touch-enabled devices).
     */
    static IS_TOUCH: boolean;
    /**
     * True if this device supports Microsoft pointer events (always false on Macs).
     */
    static IS_POINTER: boolean;
    /**
     * True if the documents location does not start with http:// or https://.
     */
    static IS_LOCAL: boolean;
    /**
     * Returns true if the current browser is supported, that is, if
     * <Client.IS_SVG> is true.
     *
     * Example:
     *
     * ```javascript
     * if (!Client.isBrowserSupported())
     * {
     *   mxUtils.error('Browser is not supported!', 200, false);
     * }
     * ```
     */
    static isBrowserSupported: () => boolean;
}
export default Client;
