import Rectangle from '../view/geometry/Rectangle';
import { Graph } from '../view/Graph';
/**
 * Returns the scale to be used for printing the graph with the given
 * bounds across the specifies number of pages with the given format. The
 * scale is always computed such that it given the given amount or fewer
 * pages in the print output. See {@link PrintPreview} for an example.
 *
 * @param pageCount Specifies the number of pages in the print output.
 * @param graph {@link Graph} that should be printed.
 * @param pageFormat Optional {@link Rectangle} that specifies the page format.
 * Default is <mxConstants.PAGE_FORMAT_A4_PORTRAIT>.
 * @param border The border along each side of every page.
 */
export declare const getScaleForPageCount: (pageCount: number, graph: Graph, pageFormat?: Rectangle, border?: number) => number;
/**
 * Copies the styles and the markup from the graph's container into the
 * given document and removes all cursor styles. The document is returned.
 *
 * This function should be called from within the document with the graph.
 * If you experience problems with missing stylesheets in IE then try adding
 * the domain to the trusted sites.
 *
 * @param graph {@link Graph} to be copied.
 * @param doc Document where the new graph is created.
 * @param x0 X-coordinate of the graph view origin. Default is 0.
 * @param y0 Y-coordinate of the graph view origin. Default is 0.
 * @param w Optional width of the graph view.
 * @param h Optional height of the graph view.
 */
export declare const show: (graph: Graph, doc?: Document | null, x0?: number, y0?: number, w?: number | null, h?: number | null) => Document;
/**
 * Prints the specified graph using a new window and the built-in print
 * dialog.
 *
 * This function should be called from within the document with the graph.
 *
 * @param graph {@link Graph} to be printed.
 */
export declare const printScreen: (graph: Graph) => void;
