import AbstractCanvas2D from '../canvas/AbstractCanvas2D';
import CellState from '../cell/CellState';
/**
 * Creates a new image export instance to be used with an export canvas. Here
 * is an example that uses this class to create an image via a backend using
 * {@link XmlExportCanvas}.
 *
 * ```javascript
 * var xmlDoc = mxUtils.createXmlDocument();
 * var root = xmlDoc.createElement('output');
 * xmlDoc.appendChild(root);
 *
 * var xmlCanvas = new mxXmlCanvas2D(root);
 * var imgExport = new mxImageExport();
 * imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
 *
 * var bounds = graph.getGraphBounds();
 * var w = Math.ceil(bounds.x + bounds.width);
 * var h = Math.ceil(bounds.y + bounds.height);
 *
 * var xml = mxUtils.getXml(root);
 * new MaxXmlRequest('export', 'format=png&w=' + w +
 * 		'&h=' + h + '&bg=#F9F7ED&xml=' + encodeURIComponent(xml))
 * 		.simulate(document, '_blank');
 * ```
 *
 * @class ImageExport
 */
declare class ImageExport {
    /**
     * Specifies if overlays should be included in the export. Default is false.
     */
    includeOverlays: boolean;
    /**
     * Draws the given state and all its descendants to the given canvas.
     */
    drawState(state: CellState, canvas: AbstractCanvas2D): void;
    /**
     * Visits the given state and all its descendants to the given canvas recursively.
     */
    visitStatesRecursive(state: CellState, canvas: AbstractCanvas2D, visitor: Function): void;
    /**
     * Returns the link for the given cell state and canvas. This returns null.
     */
    getLinkForCellState(state: CellState, canvas: AbstractCanvas2D): any;
    /**
     * Draws the given state to the given canvas.
     */
    drawCellState(state: CellState, canvas: AbstractCanvas2D): void;
    /**
     * Draws the shape of the given state.
     */
    drawShape(state: CellState, canvas: AbstractCanvas2D): void;
    /**
     * Draws the text of the given state.
     */
    drawText(state: CellState, canvas: AbstractCanvas2D): void;
    /**
     * Draws the overlays for the given state. This is called if <includeOverlays>
     * is true.
     */
    drawOverlays(state: CellState, canvas: AbstractCanvas2D): void;
}
export default ImageExport;
