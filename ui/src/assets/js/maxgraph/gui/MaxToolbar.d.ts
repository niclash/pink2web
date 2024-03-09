import MaxPopupMenu from './MaxPopupMenu';
import EventSource from '../view/event/EventSource';
import Cell from '../view/cell/Cell';
import { KeyboardEventListener, MouseEventListener, PopupMenuItem } from '../types';
interface HTMLImageElementWithProps extends HTMLImageElement {
    initialClassName?: any;
    altIcon?: any;
}
/**
 * Creates a toolbar inside a given DOM node. The toolbar may contain icons,
 * buttons and combo boxes.
 *
 * ### Event: mxEvent.SELECT
 *
 * Fires when an item was selected in the toolbar. The <code>function</code>
 * property contains the function that was selected in <selectMode>.
 *
 * @class MaxToolbar
 * @extends {EventSource}
 */
declare class MaxToolbar extends EventSource {
    constructor(container: HTMLElement);
    menu: MaxPopupMenu | null;
    currentImg: HTMLImageElementWithProps | HTMLButtonElement | null;
    selectedMode: HTMLImageElementWithProps | null;
    defaultMode: HTMLImageElementWithProps | HTMLButtonElement | null;
    defaultFunction: Function | null;
    /**
     * Reference to the DOM nodes that contains the toolbar.
     */
    container: HTMLElement;
    /**
     * Specifies if events are handled. Default is true.
     */
    enabled: boolean;
    /**
     * Specifies if <resetMode> requires a forced flag of true for resetting
     * the current mode in the toolbar. Default is false. This is set to true
     * if the toolbar item is double clicked to avoid a reset after a single
     * use of the item.
     */
    noReset: boolean;
    /**
     * Boolean indicating if the default mode should be the last selected
     * switch mode or the first inserted switch mode. Default is true, that
     * is the last selected switch mode is the default mode. The default mode
     * is the mode to be selected after a reset of the toolbar. If this is
     * false, then the default mode is the first inserted mode item regardless
     * of what was last selected. Otherwise, the selected item after a reset is
     * the previously selected item.
     */
    updateDefaultMode: boolean;
    /**
     * Adds the given function as an image with the specified title and icon
     * and returns the new image node.
     *
     * @param title Optional string that is used as the tooltip.
     * @param icon Optional URL of the image to be used. If no URL is given, then a
     * button is created.
     * @param funct Function to execute on a mouse click.
     * @param pressedIcon Optional URL of the pressed image. Default is a gray
     * background.
     * @param style Optional style classname. Default is mxToolbarItem.
     * @param factoryMethod Optional factory method for popup menu, eg.
     * (menu, evt, cell)=> { menu.addItem('Hello, World!'); }
     */
    addItem(title?: string | null, icon?: string | null, funct?: MouseEventListener | KeyboardEventListener | null, pressedIcon?: string | null, style?: string | null, factoryMethod?: ((handler: PopupMenuItem, cell: Cell | null, me: MouseEvent) => void) | null): HTMLImageElement | HTMLButtonElement;
    /**
     * Adds and returns a new SELECT element using the given style. The element
     * is placed inside a DIV with the mxToolbarComboContainer style classname.
     *
     * @param style - Optional style classname. Default is mxToolbarCombo.
     */
    addCombo(style?: string): HTMLSelectElement;
    /**
     * Adds and returns a new SELECT element using the given title as the
     * default element. The selection is reset to this element after each
     * change.
     *
     * @param title - String that specifies the title of the default element.
     * @param style - Optional style classname. Default is mxToolbarCombo.
     */
    addActionCombo(title: string, style?: string): HTMLSelectElement;
    /**
     * Adds and returns a new OPTION element inside the given SELECT element.
     * If the given value is a function then it is stored in the option's funct
     * field.
     *
     * @param combo - SELECT element that will contain the new entry.
     * @param title - String that specifies the title of the option.
     * @param value - Specifies the value associated with this option.
     */
    addOption(combo: HTMLSelectElement, title: string, value?: string | ((evt: any) => void) | null): HTMLOptionElement;
    /**
     * Adds a new selectable item to the toolbar. Only one switch mode item may
     * be selected at a time. The currently selected item is the default item
     * after a reset of the toolbar.
     */
    addSwitchMode(title: string, icon: string, funct: () => void, pressedIcon?: string | null, style?: string): HTMLImageElementWithProps;
    /**
     * Adds a new item to the toolbar. The selection is typically reset after
     * the item has been consumed, for example by adding a new vertex to the
     * graph. The reset is not carried out if the item is double clicked.
     *
     * The function argument uses the following signature: funct(evt, cell) where
     * evt is the native mouse event and cell is the cell under the mouse.
     */
    addMode(title: string | null | undefined, icon: string | null | undefined, funct: Function, pressedIcon: string, style?: string | null, toggle?: boolean): HTMLImageElementWithProps;
    /**
     * Resets the state of the previously selected mode and displays the given
     * DOM node as selected. This function fires a select event with the given
     * function as a parameter.
     */
    selectMode(domNode: HTMLImageElement, funct?: Function | null): void;
    /**
     * Selects the default mode and resets the state of the previously selected
     * mode.
     */
    resetMode(forced?: boolean): void;
    /**
     * Adds the specifies image as a separator.
     *
     * @param icon - URL of the separator icon.
     */
    addSeparator(icon: string): HTMLImageElement | HTMLButtonElement;
    /**
     * Adds a break to the container.
     */
    addBreak(): void;
    /**
     * Adds a horizontal line to the container.
     */
    addLine(): void;
    /**
     * Removes the toolbar and all its associated resources.
     */
    destroy(): void;
}
export default MaxToolbar;
