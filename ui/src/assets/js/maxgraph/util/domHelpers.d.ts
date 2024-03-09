import Editor from '../editor/Editor';
import { KeyboardEventListener, MouseEventListener } from '../types';
/**
 * Adds a hyperlink to the specified parent that invokes action on the
 * specified editor.
 *
 * @param parent DOM node to contain the new link.
 * @param text String that is used as the link label.
 * @param editor <Editor> that will execute the action.
 * @param action String that defines the name of the action to be executed.
 * @param pad Optional left-padding for the link. Default is 0.
 */
export declare const linkAction: (parent: HTMLElement, text: string, editor: Editor, action: string, pad?: number) => HTMLSpanElement;
/**
 * Adds a hyperlink to the specified parent that invokes the specified
 * function on the editor passing along the specified argument. The
 * function name is the name of a function of the editor instance,
 * not an action name.
 *
 * @param parent DOM node to contain the new link.
 * @param text String that is used as the link label.
 * @param editor <Editor> instance to execute the function on.
 * @param functName String that represents the name of the function.
 * @param arg Object that represents the argument to the function.
 * @param pad Optional left-padding for the link. Default is 0.
 */
export declare const linkInvoke: (parent: Element, text: string, editor: Editor, functName: string, arg: any, pad?: number) => HTMLSpanElement;
/**
 * Adds a hyperlink to the specified parent and invokes the given function
 * when the link is clicked.
 *
 * @param parent DOM node to contain the new link.
 * @param text String that is used as the link label.
 * @param funct Function to execute when the link is clicked.
 * @param pad Optional left-padding for the link. Default is 0.
 */
export declare const link: (parent: Element, text: string, funct: MouseEventListener | KeyboardEventListener, pad?: number) => HTMLSpanElement;
/**
 * Returns a new button with the given level and function as an onclick
 * event handler.
 *
 * ```javascript
 * document.body.appendChild(mxUtils.button('Test', (evt)=>
 * {
 *   alert('Hello, World!');
 * }));
 * ```
 *
 * @param label String that represents the label of the button.
 * @param funct Function to be called if the button is pressed.
 * @param doc Optional document to be used for creating the button. Default is the
 * current document.
 */
export declare const button: (label: string, funct: (evt: MouseEvent) => void, doc?: Document | null) => HTMLButtonElement;
