import Point from '../view/geometry/Point';
import Rectangle from '../view/geometry/Rectangle';
import Cell from '../view/cell/Cell';
import GraphDataModel from '../view/GraphDataModel';
import type { CellStateStyle, CellStyle, NumericCellStateStyleKeys } from '../types';
/**
 * Removes the cursors from the style of the given DOM node and its
 * descendants.
 *
 * @param element DOM node to remove the cursor style from.
 */
export declare const removeCursors: (element: HTMLElement) => void;
/**
 * Returns the current style of the specified element.
 *
 * @param element DOM node whose current style should be returned.
 */
export declare const getCurrentStyle: (element: HTMLElement) => CSSStyleDeclaration | null;
/**
 * Function: parseCssNumber
 *
 * Parses the given CSS numeric value adding handling for the values thin,
 * medium and thick (2, 4 and 6).
 */
export declare const parseCssNumber: (value: string) => number;
/**
 * Function: setPrefixedStyle
 *
 * Adds the given style with the standard name and an optional vendor prefix for the current
 * browser.
 *
 * ```javascript
 * mxUtils.setPrefixedStyle(node.style, 'transformOrigin', '0% 0%');
 * ```
 */
export declare const setPrefixedStyle: (style: CSSStyleDeclaration, name: string, value: string) => void;
/**
 * Function: hasScrollbars
 *
 * Returns true if the overflow CSS property of the given node is either
 * scroll or auto.
 *
 * @param node DOM node whose style should be checked for scrollbars.
 */
export declare const hasScrollbars: (node: HTMLElement) => boolean;
/**
 * Returns the client size for the current document as an {@link Rectangle}.
 */
export declare const getDocumentSize: () => Rectangle;
/**
 * Makes sure the given node is inside the visible area of the window. This
 * is done by setting the left and top in the style.
 */
export declare const fit: (node: HTMLElement) => void;
/**
 * Returns the offset for the specified container as an {@link Point}. The
 * offset is the distance from the top left corner of the container to the
 * top left corner of the document.
 *
 * @param container DOM node to return the offset for.
 * @param scollOffset Optional boolean to add the scroll offset of the document.
 * Default is false.
 */
export declare const getOffset: (container: HTMLElement, scrollOffset?: boolean) => Point;
/**
 * Returns the scroll origin of the given document or the current document
 * if no document is given.
 */
export declare const getDocumentScrollOrigin: (doc: Document) => Point;
/**
 * Returns the top, left corner of the viewrect as an {@link Point}.
 *
 * @param node DOM node whose scroll origin should be returned.
 * @param includeAncestors Whether the scroll origin of the ancestors should be
 * included. Default is false.
 * @param includeDocument Whether the scroll origin of the document should be
 * included. Default is true.
 */
export declare const getScrollOrigin: (node?: HTMLElement | null, includeAncestors?: boolean, includeDocument?: boolean) => Point;
/**
 * Converts the specified point (x, y) using the offset of the specified
 * container and returns a new {@link Point} with the result.
 *
 * ```javascript
 * let pt = mxUtils.convertPoint(graph.container,
 *   mxEvent.getClientX(evt), mxEvent.getClientY(evt));
 * ```
 *
 * @param container DOM node to use for the offset.
 * @param x X-coordinate of the point to be converted.
 * @param y Y-coordinate of the point to be converted.
 */
export declare const convertPoint: (container: HTMLElement, x: number, y: number) => Point;
/**
 * Assigns the value for the given key in the styles of the given cells, or
 * removes the key from the styles if the value is null.
 *
 * @param model <Transactions> to execute the transaction in.
 * @param cells Array of {@link Cells} to be updated.
 * @param key Key of the style to be changed.
 * @param value New value for the given key.
 */
export declare const setCellStyles: (model: GraphDataModel, cells: Cell[], key: keyof CellStateStyle, value: any) => void;
/**
 * Sets or toggles the flag bit for the given key in the cell's styles.
 * If value is null then the flag is toggled.
 *
 * Example:
 *
 * ```javascript
 * let cells = graph.getSelectionCells();
 * mxUtils.setCellStyleFlags(graph.model,
 *       cells,
 *       mxConstants.STYLE_FONTSTYLE,
 *       mxConstants.FONT_BOLD);
 * ```
 *
 * Toggles the bold font style.
 *
 * @param model <Transactions> that contains the cells.
 * @param cells Array of {@link Cells} to change the style for.
 * @param key Key of the style to be changed.
 * @param flag Integer for the bit to be changed.
 * @param value Optional boolean value for the flag.
 */
export declare const setCellStyleFlags: (model: GraphDataModel, cells: Cell[], key: NumericCellStateStyleKeys, flag: number, value: boolean) => void;
/**
 * Sets or removes the given key from the specified style and returns the
 * new style. If value is null then the flag is toggled.
 *
 * @param style The style of the Cell.
 * @param key Key of the style to be changed.
 * @param flag Integer for the bit to be changed.
 * @param value Optional boolean value for the given flag.
 */
export declare const setStyleFlag: (style: CellStyle, key: NumericCellStateStyleKeys, flag: number, value?: boolean) => CellStyle;
/**
 * Sets the opacity of the specified DOM node to the given value in %.
 *
 * @param node DOM node to set the opacity for.
 * @param value Opacity in %. Possible values are between 0 and 100.
 */
export declare const setOpacity: (node: HTMLElement | SVGElement, value: number) => void;
/**
 * @param value the value to check.
 * @param mask the binary mask to apply.
 * @returns `true` if the value matches the binary mask.
 * @private Subject to change prior being part of the public API.
 */
export declare const matchBinaryMask: (value: number, mask: number) => boolean;
/**
 * Returns an {@link Rectangle} with the size (width and height in pixels) of
 * the given string. The string may contain HTML markup. Newlines should be
 * converted to <br> before calling this method. The caller is responsible
 * for sanitizing the HTML markup.
 *
 * Example:
 *
 * ```javascript
 * let label = graph.getLabel(cell).replace(/\n/g, "<br>");
 * let size = graph.getSizeForString(label);
 * ```
 *
 * @param text String whose size should be returned.
 * @param fontSize Integer that specifies the font size in pixels. Default is
 * {@link Constants#DEFAULT_FONTSIZE}.
 * @param fontFamily String that specifies the name of the font family. Default
 * is {@link Constants#DEFAULT_FONTFAMILY}.
 * @param textWidth Optional width for text wrapping.
 * @param fontStyle Optional font style.
 */
export declare const getSizeForString: (text: string, fontSize?: number, fontFamily?: string, textWidth?: number | null, fontStyle?: number | null) => Rectangle;
/**
 * Sorts the given cells according to the order in the cell hierarchy.
 * Ascending is optional and defaults to true.
 */
export declare const sortCells: (cells: Cell[], ascending?: boolean) => Cell[];
/**
 * Returns an {@link Point} that represents the horizontal and vertical alignment
 * for numeric computations. X is -0.5 for center, -1 for right and 0 for
 * left alignment. Y is -0.5 for middle, -1 for bottom and 0 for top
 * alignment. Default values for missing arguments is top, left.
 */
export declare const getAlignmentAsPoint: (align: string, valign: string) => Point;
