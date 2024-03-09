/**
 * Register core editor i.e. codecs that don't relate to editor.
 *
 * @param force if `true` register the codecs even if they were already registered. If false, only register them
 *              if they have never been registered before.
 * @since 0.6.0
 */
export declare const registerCoreCodecs: (force?: boolean) => void;
/**
 * Register only editor codecs.
 * @param force if `true` register the codecs even if they were already registered. If false, only register them
 *              if they have never been registered before.
 * @since 0.6.0
 */
export declare const registerEditorCodecs: (force?: boolean) => void;
/**
 * Register all editors i.e. core codecs (as done by {@link registerCoreCodecs}) and editor codecs (as done by {@link registerEditorCodecs}).
 *
 * @param force if `true` register the codecs even if they were already registered. If false, only register them
 *              if they have never been registered before.
 * @since 0.6.0
 */
export declare const registerAllCodecs: (force?: boolean) => void;
