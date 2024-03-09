import ObjectCodec from '../../ObjectCodec';
import type Codec from '../../Codec';
/**
 * Custom codec for configuring {@link EditorToolbar}s.
 *
 * This class is created and registered dynamically at load time and used implicitly via {@link Codec} and the {@link CodecRegistry}.
 *
 * This codec only reads configuration data for existing toolbars handlers, it does not encode or create toolbars.
 */
export declare class EditorToolbarCodec extends ObjectCodec {
    constructor();
    /**
     * Returns `null`.
     */
    encode(_enc: any, _obj: any): null;
    /**
     * Reads a sequence of the following child nodes and attributes:
     *
     * Child Nodes:
     *
     * add - Adds a new item to the toolbar. See below for attributes.
     * separator - Adds a vertical separator. No attributes.
     * hr - Adds a horizontal separator. No attributes.
     * br - Adds a linefeed. No attributes.
     *
     * Attributes:
     *
     * as - Resource key for the label.
     * action - Name of the action to execute in enclosing editor.
     * mode - Mode name (see below).
     * template - Template name for cell insertion.
     * style - Optional style to override the template style.
     * icon - Icon (relative/absolute URL).
     * pressedIcon - Optional icon for pressed state (relative/absolute URL).
     * id - Optional ID to be used for the created DOM element.
     * toggle - Optional 0 or 1 to disable toggling of the element. Default is 1 (true).
     *
     * The action, mode and template attributes are mutually exclusive. The style can only be used with the template attribute.
     * The add node may contain another sequence of add nodes with "as" and action attributes to create a combo box in the toolbar.
     * If the icon is specified then a list of the child node is expected to have its template attribute set and the action is ignored instead.
     *
     * Nodes with a specified template may define a function to be used for inserting the cloned template into the graph.
     * Here is an example of such a node:
     *
     * ```javascript
     * <add as="Swimlane" template="swimlane" icon="images/swimlane.gif"><![CDATA[
     *   function (editor, cell, evt, targetCell)
     *   {
     *     let pt = mxUtils.convertPoint(
     *       editor.graph.container, mxEvent.getClientX(evt),
     *         mxEvent.getClientY(evt));
     *     return editor.addVertex(targetCell, cell, pt.x, pt.y);
     *   }
     * ]]></add>
     * ```
     *
     * In the above function, editor is the enclosing {@link Editor} instance, cell is the clone of the template, evt is the mouse event that represents the
     * drop and targetCell is the cell under the mouse pointer where the drop occurred. The targetCell is retrieved using {@link Graph#getCellAt}.
     *
     * Furthermore, nodes with the mode attribute may define a function to be executed upon selection of the respective toolbar icon. In the
     * example below, the default edge style is set when this specific
     * connect-mode is activated:
     *
     * ```javascript
     * <add as="connect" mode="connect"><![CDATA[
     *   function (editor)
     *   {
     *     if (editor.defaultEdge != null)
     *     {
     *       editor.defaultEdge.style = 'straightEdge';
     *     }
     *   }
     * ]]></add>
     * ```
     *
     * Both functions require {@link allowEval} to be set to `true`.
     *
     * Modes:
     *
     * select - Left mouse button used for rubberband- & cell-selection.
     * connect - Allows connecting vertices by inserting new edges.
     * pan - Disables selection and switches to panning on the left button.
     *
     * Example:
     *
     * To add items to the toolbar:
     *
     * ```javascript
     * <EditorToolbar as="toolbar">
     *   <add as="save" action="save" icon="images/save.gif"/>
     *   <br/><hr/>
     *   <add as="select" mode="select" icon="images/select.gif"/>
     *   <add as="connect" mode="connect" icon="images/connect.gif"/>
     * </EditorToolbar>
     * ```
     */
    decode(dec: Codec, _node: Element, into: any): any;
}
