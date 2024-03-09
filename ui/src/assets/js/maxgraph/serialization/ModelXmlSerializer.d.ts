import type GraphDataModel from '../view/GraphDataModel';
/**
 * Export options of {@link ModelXmlSerializer}.
 *
 * **WARN**: this is an experimental feature that is subject to change.
 *
 * @alpha
 * @experimental
 * @since 0.6.0
 */
export type ModelExportOptions = {
    /**
     * If `true`, prettify the exported xml.
     * @default true
     */
    pretty?: boolean;
};
/**
 * Convenient utility class using {@link Codec} to manage maxGraph model import and export.
 *
 * **WARN**: this is an experimental feature that is subject to change (class and method names).
 *
 * @alpha
 * @experimental
 * @since 0.6.0
 */
export declare class ModelXmlSerializer {
    private dataModel;
    constructor(dataModel: GraphDataModel);
    import(xml: string): void;
    export(options?: ModelExportOptions): string;
    /**
     * Hook for replacing codecs registered by default (core codecs).
     */
    protected registerCodecs(): void;
}
