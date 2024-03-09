import KeyHandler from '../view/handler/KeyHandler';
import Editor from './Editor';
/**
 * Binds keycodes to actionnames in an editor.  This aggregates an internal {@link handler} and extends the implementation of {@link KeyHandler.escape} to not only cancel the editing, but also hide the properties dialog and fire an <Editor.escape> event via {@link editor}.  An instance of this class is created by {@link Editor} and stored in {@link Editor.keyHandler}.
 *
 * @Example
 * Bind the delete key to the delete action in an existing editor.
 * ```javascript
 * var keyHandler = new EditorKeyHandler(editor);
 * keyHandler.bindAction(46, 'delete');
 * ```
 *
 * @Codec
 * This class uses the {@link DefaultKeyHandlerCodec} to read configuration data into an existing instance.  See {@link DefaultKeyHandlerCodec} for a description of the configuration format.
 *
 * @Keycodes
 * See {@link KeyHandler}.
 * An {@link InternalEvent.ESCAPE} event is fired via the editor if the escape key is pressed.
 */
export declare class EditorKeyHandler {
    constructor(editor?: Editor | null);
    /**
     * Reference to the enclosing {@link Editor}.
     */
    editor: Editor | null;
    /**
     * Holds the {@link KeyHandler} for key event handling.
     */
    handler: KeyHandler | null;
    /**
     * Binds the specified keycode to the given action in {@link editor}.  The optional control flag specifies if the control key must be pressed to trigger the action.
     *
     * @param code      Integer that specifies the keycode.
     * @param action    Name of the action to execute in {@link editor}.
     * @param control   Optional boolean that specifies if control must be pressed.  Default is false.
     */
    bindAction(code: number, action: string, control?: boolean): void;
    /**
     * Destroys the {@link handler} associated with this object.  This does normally not need to be called, the {@link handler} is destroyed automatically when the window unloads (in IE) by {@link Editor}.
     */
    destroy(): void;
}
export default EditorKeyHandler;
