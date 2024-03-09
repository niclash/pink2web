import Cell from '../view/cell/Cell';
import MaxPopupMenu from '../gui/MaxPopupMenu';
import Editor from './Editor';
import { PopupMenuItem } from '../types';
/**
 * Creates popupmenus for mouse events.  This object holds an XML node which is a description of the popup menu to be created.  In {@link createMenu}, the configuration is applied to the context and the resulting menu items are added to the menu dynamically.  See {@link createMenu} for a description of the configuration format.
 * This class does not create the DOM nodes required for the popup menu, it only parses an XML description to invoke the respective methods on an {@link mxPopupMenu} each time the menu is displayed.
 *
 * @Codec
 * This class uses the {@link DefaultPopupMenuCodec} to read configuration data into an existing instance, however, the actual parsing is done by this class during program execution, so the format is described below.
 */
export declare class EditorPopupMenu {
    constructor(config?: Element | null);
    /**
     * Base path for all icon attributes in the config.  Default is null.
     *
     * @default null
     */
    imageBasePath: string | null;
    /**
     * XML node used as the description of new menu items.  This node is used in {@link createMenu} to dynamically create the menu items if their respective conditions evaluate to true for the given arguments.
     */
    config: Element | null;
    /**
     * This function is called from {@link Editor} to add items to the
     * given menu based on {@link config}. The config is a sequence of
     * the following nodes and attributes.
     *
     * @ChildNodes:
     *
     * add - Adds a new menu item. See below for attributes.
     * separator - Adds a separator. No attributes.
     * condition - Adds a custom condition. Name attribute.
     *
     * The add-node may have a child node that defines a function to be invoked
     * before the action is executed (or instead of an action to be executed).
     *
     * @Attributes:
     *
     * as - Resource key for the label (needs entry in property file).
     * action - Name of the action to execute in enclosing editor.
     * icon - Optional icon (relative/absolute URL).
     * iconCls - Optional CSS class for the icon.
     * if - Optional name of condition that must be true (see below).
     * enabled-if - Optional name of condition that specifies if the menu item
     * should be enabled.
     * name - Name of custom condition. Only for condition nodes.
     *
     * @Conditions:
     *
     * nocell - No cell under the mouse.
     * ncells - More than one cell selected.
     * notRoot - Drilling position is other than home.
     * cell - Cell under the mouse.
     * notEmpty - Exactly one cell with children under mouse.
     * expandable - Exactly one expandable cell under mouse.
     * collapsable - Exactly one collapsable cell under mouse.
     * validRoot - Exactly one cell which is a possible root under mouse.
     * swimlane - Exactly one cell which is a swimlane under mouse.
     *
     * @Example:
     *
     * To add a new item for a given action to the popupmenu:
     *
     * ```
     * <EditorPopupMenu as="popupHandler">
     *   <add as="delete" action="delete" icon="images/delete.gif" if="cell"/>
     * </EditorPopupMenu>
     * ```
     *
     * To add a new item for a custom function:
     *
     * ```
     * <EditorPopupMenu as="popupHandler">
     *   <add as="action1"><![CDATA[
     *		function (editor, cell, evt)
     *		{
     *			editor.execute('action1', cell, 'myArg');
     *		}
     *   ]]></add>
     * </EditorPopupMenu>
     * ```
     *
     * The above example invokes action1 with an additional third argument via
     * the editor instance. The third argument is passed to the function that
     * defines action1. If the add-node has no action-attribute, then only the
     * function defined in the text content is executed, otherwise first the
     * function and then the action defined in the action-attribute is
     * executed. The function in the text content has 3 arguments, namely the
     * {@link Editor} instance, the {@link mxCell} instance under the mouse, and the
     * native mouse event.
     *
     * Custom Conditions:
     *
     * To add a new condition for popupmenu items:
     *
     * ```
     * <condition name="condition1"><![CDATA[
     *   function (editor, cell, evt)
     *   {
     *     return cell != null;
     *   }
     * ]]></condition>
     * ```
     *
     * The new condition can then be used in any item as follows:
     *
     * ```
     * <add as="action1" action="action1" icon="action1.gif" if="condition1"/>
     * ```
     *
     * The order in which the items and conditions appear is not significant as
     * all conditions are evaluated before any items are created.
     *
     * @param editor - Enclosing {@link Editor} instance.
     * @param menu - {@link mxPopupMenu} that is used for adding items and separators.
     * @param cell - Optional {@link mxCell} which is under the mousepointer.
     * @param evt - Optional mouse event which triggered the menu.
     */
    createMenu(editor: Editor, menu: MaxPopupMenu, cell?: Cell | null, evt?: MouseEvent | null): void;
    /**
     * Recursively adds the given items and all of its children into the given menu.
     *
     * @param editor Enclosing <Editor> instance.
     * @param menu {@link PopupMenu} that is used for adding items and separators.
     * @param cell Optional <Cell> which is under the mousepointer.
     * @param evt Optional mouse event which triggered the menu.
     * @param conditions Array of names boolean conditions.
     * @param item XML node that represents the current menu item.
     * @param parent DOM node that represents the parent menu item.
     */
    addItems(editor: Editor, menu: MaxPopupMenu, cell: Cell | null | undefined, evt: MouseEvent | null | undefined, conditions: any, item: Element, parent?: PopupMenuItem | null): void;
    /**
     * Helper method to bind an action to a new menu item.
     *
     * @param menu {@link PopupMenu} that is used for adding items and separators.
     * @param editor Enclosing <Editor> instance.
     * @param lab String that represents the label of the menu item.
     * @param icon Optional URL that represents the icon of the menu item.
     * @param action Optional name of the action to execute in the given editor.
     * @param funct Optional function to execute before the optional action. The
     * function takes an <Editor>, the <Cell> under the mouse and the
     * mouse event that triggered the call.
     * @param cell Optional <Cell> to use as an argument for the action.
     * @param parent DOM node that represents the parent menu item.
     * @param iconCls Optional CSS class for the menu icon.
     * @param enabled Optional boolean that specifies if the menu item is enabled.
     * Default is true.
     */
    addAction(menu: MaxPopupMenu, editor: Editor, lab: string, icon?: string | null, funct?: Function | null, action?: string | null, cell?: Cell | null, parent?: PopupMenuItem | null, iconCls?: string | null, enabled?: boolean): PopupMenuItem;
    /**
     * Evaluates the default conditions for the given context.
     *
     * @param editor
     * @param cell
     * @param evt
     */
    createConditions(editor: Editor, cell?: Cell | null, evt?: MouseEvent | null): void;
}
export default EditorPopupMenu;
