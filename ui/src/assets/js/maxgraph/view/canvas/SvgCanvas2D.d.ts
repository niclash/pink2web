import AbstractCanvas2D from './AbstractCanvas2D';
import { AlignValue, ColorValue, DirectionValue, Gradient, GradientMap, OverflowValue, TextDirectionValue, VAlignValue } from '../../types';
/**
 * Extends {@link mxAbstractCanvas2D} to implement a canvas for SVG. This canvas writes all calls as SVG output to the
 * given SVG root node.
 *
 * ```javascript
 * var svgDoc = mxUtils.createXmlDocument();
 * var root = (svgDoc.createElementNS != null) ?
 * 		svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
 *
 * if (svgDoc.createElementNS == null)
 * {
 *   root.setAttribute('xmlns', mxConstants.NS_SVG);
 *   root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
 * }
 * else
 * {
 *   root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
 * }
 *
 * var bounds = graph.getGraphBounds();
 * root.setAttribute('width', (bounds.x + bounds.width + 4) + 'px');
 * root.setAttribute('height', (bounds.y + bounds.height + 4) + 'px');
 * root.setAttribute('version', '1.1');
 *
 * svgDoc.appendChild(root);
 *
 * var svgCanvas = new mxSvgCanvas2D(root);
 * ```
 *
 *
 * To disable anti-aliasing in the output, use the following code.
 * ```javascript
 * graph.view.canvas.ownerSVGElement.setAttribute('shape-rendering', 'crispEdges');
 * ```
 * Or set the respective attribute in the SVG element directly.
 */
declare class SvgCanvas2D extends AbstractCanvas2D {
    constructor(root: SVGElement, styleEnabled: boolean);
    root: SVGElement | null;
    gradients: GradientMap;
    defs: SVGDefsElement | null;
    styleEnabled: boolean;
    /**
     * Holds the current DOM node.
     */
    node: SVGElement | null;
    /**
     * Specifies if plain text output should match the vertical HTML alignment.
     * @default true.
     */
    matchHtmlAlignment: boolean;
    /**
     * Specifies if text output should be enabled.
     * @default true
     */
    textEnabled: boolean;
    /**
     * Specifies if use of foreignObject for HTML markup is allowed.
     * @default true
     */
    foEnabled: boolean;
    /**
     * Specifies the fallback text for unsupported foreignObjects in exported documents.
     * If this is set to `null` then no fallback text is added to the exported document.
     * @default [Object]
     */
    foAltText: string;
    /**
     * Offset to be used for foreignObjects.
     * @default 0
     */
    foOffset: number;
    /**
     * Offset to be used for text elements.
     * @default 0
     */
    textOffset: number;
    /**
     * Offset to be used for image elements.
     * @default 0
     */
    imageOffset: number;
    /**
     * Adds transparent paths for strokes.
     * @default 0
     */
    strokeTolerance: number;
    /**
     * Minimum stroke width for output.
     * @default 1
     */
    minStrokeWidth: number;
    /**
     * Local counter for references in SVG export.
     * @default 0
     */
    refCount: number;
    /**
     * Correction factor for {@link mxConstants.LINE_HEIGHT} in HTML output.
     * @default 1
     */
    lineHeightCorrection: number;
    /**
     * Default value for active pointer events.
     * @default all
     */
    pointerEventsValue: string;
    /**
     * Padding to be added for text that is not wrapped to account for differences in font metrics on different platforms in pixels.
     * @default 10.
     */
    fontMetricsPadding: number;
    /**
     * Specifies if offsetWidth and offsetHeight should be cached. This is used to speed up repaint of text in {@link updateText}.
     * @default true
     */
    cacheOffsetSize: boolean;
    originalRoot: SVGElement | null;
    /**
     * Updates existing DOM nodes for text rendering.
     */
    static createCss: (w: number, h: number, align: AlignValue, valign: string, wrap: boolean, overflow: string, clip: boolean, bg: ColorValue | null, border: ColorValue | null, flex: string, block: string, scale: number, callback: (dx: number, dy: number, flex: string, item: string, block: string, ofl: string) => void) => void;
    /**
     * Rounds all numbers to 2 decimal points.
     */
    format(value: number): number;
    /**
     * Returns the URL of the page without the hash part. This needs to use href to
     * include any search part with no params (ie question mark alone). This is a
     * workaround for the fact that window.location.search is empty if there is
     * no search string behind the question mark.
     */
    getBaseUrl(): string;
    /**
     * Returns any offsets for rendering pixels.
     */
    reset(): void;
    end(): void;
    /**
     * Creates the optional style section.
     */
    createStyle(): SVGElement;
    /**
     * Private helper function to create SVG elements
     */
    createElement(tagName: string, namespace?: string): SVGElement;
    /**
     * Returns the alternate text string for the given foreignObject.
     */
    getAlternateText(fo: SVGForeignObjectElement, x: number, y: number, w: number, h: number, str: Element | string, align: AlignValue, valign: VAlignValue, wrap: boolean, format: string, overflow: OverflowValue, clip: boolean, rotation: number): string | null;
    /**
     * Returns the alternate content for the given foreignObject.
     */
    createAlternateContent(fo: SVGForeignObjectElement, x: number, y: number, w: number, h: number, str: string, align: AlignValue, valign: VAlignValue, wrap: boolean, format: string, overflow: OverflowValue, clip: boolean, rotation: number): SVGElement | null;
    /**
     * Private helper function to create SVG elements
     */
    createGradientId(start: string, end: string, alpha1: number, alpha2: number, direction: DirectionValue): string;
    /**
     * Private helper function to create SVG elements
     */
    getSvgGradient(start: string, end: string, alpha1: number, alpha2: number, direction: DirectionValue): string | null;
    /**
     * Creates the given SVG gradient.
     */
    createSvgGradient(start: string, end: string, alpha1: number, alpha2: number, direction: DirectionValue): Gradient;
    /**
     * Private helper function to create SVG elements
     */
    addNode(filled: boolean, stroked: boolean): void;
    /**
     * Transfers the stroke attributes from <state> to <node>.
     */
    updateFill(): void;
    /**
     * Returns the current stroke width (>= 1), ie. max(1, this.format(this.state.strokeWidth * this.state.scale)).
     */
    getCurrentStrokeWidth(): number;
    /**
     * Transfers the stroke attributes from {@link mxAbstractCanvas2D.state} to {@link node}.
     */
    updateStroke(): void;
    /**
     * Transfers the stroke attributes from {@link mxAbstractCanvas2D.state} to {@link node}.
     */
    updateStrokeAttributes(): void;
    /**
     * Creates the SVG dash pattern for the given state.
     */
    createDashPattern(scale: number): string;
    /**
     * Creates a hit detection tolerance shape for the given node.
     */
    createTolerance(node: SVGElement): SVGElement;
    /**
     * Creates a shadow for the given node.
     */
    createShadow(node: SVGElement): SVGElement;
    /**
     * Experimental implementation for hyperlinks.
     */
    setLink(link: string): void;
    /**
     * Sets the rotation of the canvas. Note that rotation cannot be concatenated.
     */
    rotate(theta: number, flipH: boolean, flipV: boolean, cx: number, cy: number): void;
    /**
     * Extends superclass to create path.
     */
    begin(): void;
    /**
     * Private helper function to create SVG elements
     */
    rect(x: number, y: number, w: number, h: number): void;
    /**
     * Private helper function to create SVG elements
     */
    roundrect(x: number, y: number, w: number, h: number, dx: number, dy: number): void;
    /**
     * Private helper function to create SVG elements
     */
    ellipse(x: number, y: number, w: number, h: number): void;
    /**
     * Private helper function to create SVG elements
     */
    image(x: number, y: number, w: number, h: number, src: string, aspect?: boolean, flipH?: boolean, flipV?: boolean): void;
    /**
     * Converts the given HTML string to XHTML.
     */
    convertHtml(val: string): string;
    /**
     * Private helper function to create SVG elements
     * Note: signature changed in mxgraph 4.1.0
     */
    createDiv(str: string | HTMLElement): HTMLElement;
    /**
     * Updates existing DOM nodes for text rendering. LATER: Merge common parts with text function below.
     */
    updateText(x: number, y: number, w: number, h: number, align: AlignValue, valign: VAlignValue, wrap: boolean, overflow: OverflowValue, clip: boolean, rotation: number, node: SVGElement): void;
    /**
     * Creates a foreignObject for the given string and adds it to the given root.
     */
    addForeignObject(x: number, y: number, w: number, h: number, str: string, align: AlignValue, valign: VAlignValue, wrap: boolean, format: string, overflow: OverflowValue, clip: boolean, rotation: number, dir: TextDirectionValue, div: HTMLElement, root: SVGElement): void;
    /**
     * Updates existing DOM nodes for text rendering.
     */
    updateTextNodes(x: number, y: number, w: number, h: number, align: AlignValue, valign: VAlignValue, wrap: boolean, overflow: OverflowValue, clip: boolean, rotation: number, g: SVGElement): void;
    /**
     * Private helper function to create SVG elements
     */
    getTextCss(): string;
    /**
     * Paints the given text. Possible values for format are empty string for plain
     * text and html for HTML markup. Note that HTML markup is only supported if
     * foreignObject is supported and <foEnabled> is true. (This means IE9 and later
     * does currently not support HTML text as part of shapes.)
     */
    text(x: number, y: number, w: number, h: number, str: string, align: AlignValue, valign: VAlignValue, wrap: boolean, format: string, overflow: OverflowValue, clip: boolean, rotation: number | undefined, dir: TextDirectionValue): void;
    /**
     * Creates a clip for the given coordinates.
     */
    createClip(x: number, y: number, w: number, h: number): SVGElement;
    /**
     * Paints the given text. Possible values for format are empty string for
     * plain text and html for HTML markup.
     */
    plainText(x: number, y: number, w: number, h: number, str: string, align: AlignValue, valign: VAlignValue, wrap: boolean, overflow: OverflowValue, clip: boolean, rotation: number | undefined, dir: TextDirectionValue): void;
    /**
     * Updates the text properties for the given node. (NOTE: For this to work in
     * IE, the given node must be a text or tspan element.)
     */
    updateFont(node: SVGElement): void;
    /**
     * Background color and border
     */
    addTextBackground(node: SVGElement, str: string, x: number, y: number, w: number, h: number, align: AlignValue, valign: VAlignValue, overflow: OverflowValue): void;
    /**
     * Paints the outline of the current path.
     */
    stroke(): void;
    /**
     * Fills the current path.
     */
    fill(): void;
    /**
     * Fills and paints the outline of the current path.
     */
    fillAndStroke(): void;
}
export default SvgCanvas2D;
