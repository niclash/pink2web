/**
 * Converts relative and absolute URLs to absolute URLs with protocol and domain.
 */
declare class UrlConverter {
    constructor();
    /**
     * Specifies if the converter is enabled. Default is true.
     */
    enabled: boolean;
    /**
     * Specifies the base URL to be used as a prefix for relative URLs.
     */
    baseUrl: string | null;
    /**
     * Specifies the base domain to be used as a prefix for absolute URLs.
     */
    baseDomain: string | null;
    /**
     * Private helper function to update the base URL.
     */
    updateBaseUrl(): void;
    /**
     * Returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Sets <enabled>.
     */
    setEnabled(value: boolean): void;
    /**
     * Returns <baseUrl>.
     */
    getBaseUrl(): string | null;
    /**
     * Sets <baseUrl>.
     */
    setBaseUrl(value: string): void;
    /**
     * Returns <baseDomain>.
     */
    getBaseDomain(): string | null;
    /**
     * Sets <baseDomain>.
     */
    setBaseDomain(value: string): void;
    /**
     * Returns true if the given URL is relative.
     */
    isRelativeUrl(url: string): boolean | "";
    /**
     * Converts the given URL to an absolute URL with protol and domain.
     * Relative URLs are first converted to absolute URLs.
     */
    convert(url: string): string;
}
export default UrlConverter;
