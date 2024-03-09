import ObjectCodec from '../../ObjectCodec';
import Editor from '../../../editor/Editor';
import type Codec from '../../Codec';
/**
 * Codec for {@link Editor}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * Transient Fields:
 *
 * - modified
 * - lastSnapshot
 * - ignoredChanges
 * - undoManager
 * - graphContainer
 * - toolbarContainer
 */
export declare class EditorCodec extends ObjectCodec {
    constructor();
    /**
     * Decodes the ui-part of the configuration node by reading
     * a sequence of the following child nodes and attributes
     * and passes the control to the default decoding mechanism:
     *
     * Child Nodes:
     *
     * stylesheet - Adds a CSS stylesheet to the document.
     * resource - Adds the basename of a resource bundle.
     * add - Creates or configures a known UI element.
     *
     * These elements may appear in any order given that the
     * graph UI element is added before the toolbar element
     * (see Known Keys).
     *
     * Attributes:
     *
     * as - Key for the UI element (see below).
     * element - ID for the element in the document.
     * style - CSS style to be used for the element or window.
     * x - X coordinate for the new window.
     * y - Y coordinate for the new window.
     * width - Width for the new window.
     * height - Optional height for the new window.
     * name - Name of the stylesheet (absolute/relative URL).
     * basename - Basename of the resource bundle (see {@link Resources}).
     *
     * The x, y, width and height attributes are used to create a new
     * <MaxWindow> if the element attribute is not specified in an add
     * node. The name and basename are only used in the stylesheet and
     * resource nodes, respectively.
     *
     * Known Keys:
     *
     * graph - Main graph element (see <Editor.setGraphContainer>).
     * title - Title element (see <Editor.setTitleContainer>).
     * toolbar - Toolbar element (see <Editor.setToolbarContainer>).
     * status - Status bar element (see <Editor.setStatusContainer>).
     *
     * Example:
     *
     * ```javascript
     * <ui>
     *   <stylesheet name="css/process.css"/>
     *   <resource basename="resources/app"/>
     *   <add as="graph" element="graph"
     *     style="left:70px;right:20px;top:20px;bottom:40px"/>
     *   <add as="status" element="status"/>
     *   <add as="toolbar" x="10" y="20" width="54"/>
     * </ui>
     * ```
     */
    afterDecode(dec: Codec, node: Element, obj: any): any;
    /**
     * Overrides decode child to handle special child nodes.
     */
    decodeChild(dec: Codec, child: Element, obj: any): void;
    /**
     * Decodes the ui elements from the given node.
     */
    decodeUi(dec: Codec, node: Element, editor: Editor): void;
    /**
     * Decodes the cells from the given node as templates.
     */
    decodeTemplates(dec: Codec, node: Element, editor: Editor): void;
}
