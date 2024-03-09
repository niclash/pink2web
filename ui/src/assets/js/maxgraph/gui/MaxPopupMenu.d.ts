import EventSource from '../view/event/EventSource';
import Cell from '../view/cell/Cell';
import InternalMouseEvent from '../view/event/InternalMouseEvent';
import { PopupMenuItem } from '../types';
/**
 * Basic popup menu. To add a vertical scrollbar to a given submenu, the
 * following code can be used.
 *
 * ```javascript
 * let mxPopupMenuShowMenu = showMenu;
 * showMenu = ()=>
 * {
 *   mxPopupMenuShowMenu.apply(this, arguments);
 *
 *   this.div.style.overflowY = 'auto';
 *   this.div.style.overflowX = 'hidden';
 *   this.div.style.maxHeight = '160px';
 * };
 * ```
 *
 * Constructor: mxPopupMenu
 *
 * Constructs a popupmenu.
 *
 * Event: mxEvent.SHOW
 *
 * Fires after the menu has been shown in <popup>.
 */
declare class MaxPopupMenu extends EventSource {
    constructor(factoryMethod?: (handler: PopupMenuItem, cell: Cell | null, me: MouseEvent) => void);
    div: HTMLElement;
    table: HTMLElement;
    tbody: HTMLElement;
    activeRow: PopupMenuItem | null;
    eventReceiver: HTMLElement | null;
    /**
     * URL of the image to be used for the submenu icon.
     */
    submenuImage: string;
    /**
     * Specifies the zIndex for the popupmenu and its shadow. Default is 1006.
     */
    zIndex: number;
    /**
     * Function that is used to create the popup menu. The function takes the
     * current panning handler, the <Cell> under the mouse and the mouse
     * event that triggered the call as arguments.
     */
    factoryMethod?: (handler: PopupMenuItem, cell: Cell | null, me: MouseEvent) => void;
    /**
     * Specifies if popupmenus should be activated by clicking the left mouse
     * button. Default is false.
     */
    useLeftButtonForPopup: boolean;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Contains the number of times <addItem> has been called for a new menu.
     */
    itemCount: number;
    /**
     * Specifies if submenus should be expanded on mouseover. Default is false.
     */
    autoExpand: boolean;
    /**
     * Specifies if separators should only be added if a menu item follows them.
     * Default is false.
     */
    smartSeparators: boolean;
    /**
     * Specifies if any labels should be visible. Default is true.
     */
    labels: boolean;
    willAddSeparator: boolean;
    containsItems: boolean;
    /**
     * Returns true if events are handled. This implementation
     * returns <enabled>.
     */
    isEnabled(): boolean;
    /**
     * Enables or disables event handling. This implementation
     * updates <enabled>.
     */
    setEnabled(enabled: boolean): void;
    /**
     * Returns true if the given event is a popupmenu trigger for the optional
     * given cell.
     *
     * @param me {@link MouseEvent} that represents the mouse event.
     */
    isPopupTrigger(me: InternalMouseEvent): boolean;
    /**
     * Adds the given item to the given parent item. If no parent item is specified
     * then the item is added to the top-level menu. The return value may be used
     * as the parent argument, ie. as a submenu item. The return value is the table
     * row that represents the item.
     *
     * Paramters:
     *
     * title - String that represents the title of the menu item.
     * image - Optional URL for the image icon.
     * funct - Function associated that takes a mouseup or touchend event.
     * parent - Optional item returned by <addItem>.
     * iconCls - Optional string that represents the CSS class for the image icon.
     * IconsCls is ignored if image is given.
     * enabled - Optional boolean indicating if the item is enabled. Default is true.
     * active - Optional boolean indicating if the menu should implement any event handling.
     * Default is true.
     * noHover - Optional boolean to disable hover state.
     */
    addItem(title: string, image: string | null, funct: Function, parent?: PopupMenuItem | null, iconCls?: string | null, enabled?: boolean, active?: boolean, noHover?: boolean): PopupMenuItem;
    /**
     * Adds a checkmark to the given menuitem.
     */
    addCheckmark(item: HTMLElement, img: string): void;
    /**
     * Creates the nodes required to add submenu items inside the given parent
     * item. This is called in <addItem> if a parent item is used for the first
     * time. This adds various DOM nodes and a <submenuImage> to the parent.
     *
     * @param parent An item returned by <addItem>.
     */
    createSubmenu(parent: PopupMenuItem): void;
    /**
     * Shows the submenu inside the given parent row.
     */
    showSubmenu(parent: PopupMenuItem, row: PopupMenuItem): void;
    /**
     * Adds a horizontal separator in the given parent item or the top-level menu
     * if no parent is specified.
     *
     * @param parent Optional item returned by <addItem>.
     * @param force Optional boolean to ignore <smartSeparators>. Default is false.
     */
    addSeparator(parent?: PopupMenuItem | null, force?: boolean): void;
    /**
     * Shows the popup menu for the given event and cell.
     *
     * Example:
     *
     * ```javascript
     * graph.getPlugin('PanningHandler').popup(x, y, cell, evt)
     * {
     *   mxUtils.alert('Hello, World!');
     * }
     * ```
     */
    popup(x: number, y: number, cell: Cell | null, evt: MouseEvent): void;
    /**
     * Returns true if the menu is showing.
     */
    isMenuShowing(): boolean;
    /**
     * Shows the menu.
     */
    showMenu(): void;
    /**
     * Removes the menu and all submenus.
     */
    hideMenu(): void;
    /**
     * Removes all submenus inside the given parent.
     *
     * @param parent An item returned by <addItem>.
     */
    hideSubmenu(parent: PopupMenuItem): void;
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    destroy(): void;
}
export default MaxPopupMenu;
