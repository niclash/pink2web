import Rectangle from '../geometry/Rectangle';
import Cell from '../cell/Cell';
import InternalMouseEvent from '../event/InternalMouseEvent';
import CellState from '../cell/CellState';
import EventSource from '../event/EventSource';
import type { Graph } from '../Graph';
import type { GraphPlugin } from '../../types';
/**
 * In-place editor for the graph. To control this editor, use
 * {@link Graph#invokesStopCellEditing}, {@link Graph#enterStopsCellEditing} and
 * {@link Graph#escapeEnabled}. If {@link Graph#enterStopsCellEditing} is true then
 * ctrl-enter or shift-enter can be used to create a linefeed. The F2 and
 * escape keys can always be used to stop editing.
 *
 * To customize the location of the textbox in the graph, override
 * <getEditorBounds> as follows:
 *
 * ```javascript
 * graph.cellEditor.getEditorBounds = (state)=>
 * {
 *   let result = getEditorBounds.apply(this, arguments);
 *
 *   if (this.graph.getDataModel().isEdge(state.cell))
 *   {
 *     result.x = state.getCenterX() - result.width / 2;
 *     result.y = state.getCenterY() - result.height / 2;
 *   }
 *
 *   return result;
 * };
 * ```
 *
 * Note that this hook is only called if <autoSize> is false. If <autoSize> is true,
 * then {@link Shape#getLabelBounds} is used to compute the current bounds of the textbox.
 *
 * The textarea uses the mxCellEditor CSS class. You can modify this class in
 * your custom CSS. Note: You should modify the CSS after loading the client
 * in the page.
 *
 * Example:
 *
 * To only allow numeric input in the in-place editor, use the following code.
 *
 * ```javascript
 * let text = graph.cellEditor.textarea;
 *
 * mxEvent.addListener(text, 'keydown', function (evt)
 * {
 *   if (!(evt.keyCode >= 48 && evt.keyCode <= 57) &&
 *       !(evt.keyCode >= 96 && evt.keyCode <= 105))
 *   {
 *     mxEvent.consume(evt);
 *   }
 * });
 * ```
 *
 * Placeholder:
 *
 * To implement a placeholder for cells without a label, use the
 * <emptyLabelText> variable.
 *
 * Resize in Chrome:
 *
 * Resize of the textarea is disabled by default. If you want to enable
 * this feature extend <init> and set this.textarea.style.resize = ''.
 *
 * To start editing on a key press event, the container of the graph
 * should have focus or a focusable parent should be used to add the
 * key press handler as follows.
 *
 * ```javascript
 * mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(this, (evt)=>
 * {
 *   if (!graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
 *       !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
 *   {
 *     graph.startEditing();
 *
 *     if (Client.IS_FF)
 *     {
 *       graph.cellEditor.textarea.value = String.fromCharCode(evt.which);
 *     }
 *   }
 * }));
 * ```
 *
 * To allow focus for a DIV, and hence to receive key press events, some browsers
 * require it to have a valid tabindex attribute. In this case the following
 * code may be used to keep the container focused.
 *
 * ```javascript
 * let graphFireMouseEvent = graph.fireMouseEvent;
 * graph.fireMouseEvent = (evtName, me, sender)=>
 * {
 *   if (evtName == mxEvent.MOUSE_DOWN)
 *   {
 *     this.container.focus();
 *   }
 *
 *   graphFireMouseEvent.apply(this, arguments);
 * };
 * ```
 *
 * Constructor: mxCellEditor
 *
 * Constructs a new in-place editor for the specified graph.
 *
 * @param graph Reference to the enclosing {@link Graph}.
 */
declare class CellEditorHandler implements GraphPlugin {
    static pluginId: string;
    constructor(graph: Graph);
    changeHandler: (sender: EventSource) => void;
    zoomHandler: () => void;
    clearOnChange: boolean;
    bounds: Rectangle | null;
    resizeThread: number | null;
    textDirection: '' | 'auto' | 'ltr' | 'rtl' | null;
    /**
     * Reference to the enclosing {@link Graph}.
     */
    graph: Graph;
    /**
     * Holds the DIV that is used for text editing. Note that this may be null before the first
     * edit. Instantiated in <init>.
     */
    textarea: HTMLElement | null;
    /**
     * Reference to the <Cell> that is currently being edited.
     */
    editingCell: Cell | null;
    /**
     * Reference to the event that was used to start editing.
     */
    trigger: InternalMouseEvent | MouseEvent | null;
    /**
     * Specifies if the label has been modified.
     */
    modified: boolean;
    /**
     * Specifies if the textarea should be resized while the text is being edited.
     * Default is true.
     */
    autoSize: boolean;
    /**
     * Specifies if the text should be selected when editing starts. Default is
     * true.
     */
    selectText: boolean;
    /**
     * Text to be displayed for empty labels. Default is '' or '<br>' in Firefox as
     * a workaround for the missing cursor bug for empty content editable. This can
     * be set to eg. "[Type Here]" to easier visualize editing of empty labels. The
     * value is only displayed before the first keystroke and is never used as the
     * actual editing value.
     */
    emptyLabelText: string;
    /**
     * If true, pressing the escape key will stop editing and not accept the new
     * value. Change this to false to accept the new value on escape, and cancel
     * editing on Shift+Escape instead. Default is true.
     */
    escapeCancelsEditing: boolean;
    /**
     * Reference to the label DOM node that has been hidden.
     */
    textNode: SVGGElement | null;
    /**
     * Specifies the zIndex for the textarea. Default is 5.
     */
    zIndex: number;
    /**
     * Defines the minimum width and height to be used in <resize>. Default is 0x20px.
     */
    minResize: Rectangle;
    /**
     * Correction factor for word wrapping width. Default is 2 in quirks, 0 in IE
     * 11 and 1 in all other browsers and modes.
     */
    wordWrapPadding: number;
    /**
     * If <focusLost> should be called if <textarea> loses the focus. Default is false.
     */
    blurEnabled: boolean;
    /**
     * Holds the initial editing value to check if the current value was modified.
     */
    initialValue: string | null;
    /**
     * Holds the current temporary horizontal alignment for the cell style. If this
     * is modified then the current text alignment is changed and the cell style is
     * updated when the value is applied.
     */
    align: string | null;
    /**
     * Creates the <textarea> and installs the event listeners. The key handler
     * updates the {@link odified} state.
     */
    init(): void;
    /**
     * Called in <stopEditing> if cancel is false to invoke {@link Graph#labelChanged}.
     */
    applyValue(state: CellState, value: any): void;
    /**
     * Sets the temporary horizontal alignment for the current editing session.
     */
    setAlign(align: string): void;
    /**
     * Gets the initial editing value for the given cell.
     */
    getInitialValue(state: CellState, trigger: MouseEvent | null): string;
    /**
     * Returns the current editing value.
     */
    getCurrentValue(state: CellState): string | null;
    /**
     * Returns true if <escapeCancelsEditing> is true and shift, control and meta
     * are not pressed.
     */
    isCancelEditingKeyEvent(evt: MouseEvent | KeyboardEvent): boolean;
    /**
     * Installs listeners for focus, change and standard key event handling.
     */
    installListeners(elt: HTMLElement): void;
    /**
     * Returns true if the given keydown event should stop cell editing. This
     * returns true if F2 is pressed of if {@link Graph#enterStopsCellEditing} is true
     * and enter is pressed without control or shift.
     */
    isStopEditingEvent(evt: KeyboardEvent): boolean;
    /**
     * Returns true if this editor is the source for the given native event.
     */
    isEventSource(evt: MouseEvent | KeyboardEvent): boolean;
    /**
     * Returns {@link odified}.
     */
    resize(): void;
    /**
     * Called if the textarea has lost focus.
     */
    focusLost(): void;
    /**
     * Returns the background color for the in-place editor. This implementation
     * always returns NONE.
     */
    getBackgroundColor(state: CellState): string;
    /**
     * Starts the editor for the given cell.
     *
     * @param cell <Cell> to start editing.
     * @param trigger Optional mouse event that triggered the editor.
     */
    startEditing(cell: Cell, trigger?: MouseEvent | null): void;
    /**
     * Returns <selectText>.
     */
    isSelectText(): boolean;
    /**
    clearSelection() {
      const selection = window.getSelection();
  
      if (selection) {
        if (selection.empty) {
          selection.empty();
        } else if (selection.removeAllRanges) {
          selection.removeAllRanges();
        }
      }
    }
  
    /**
     * Stops the editor and applies the value if cancel is false.
     */
    stopEditing(cancel?: boolean): void;
    /**
     * Prepares the textarea for getting its value in <stopEditing>.
     * This implementation removes the extra trailing linefeed in Firefox.
     */
    prepareTextarea(): void;
    /**
     * Returns true if the label should be hidden while the cell is being
     * edited.
     */
    isHideLabel(state?: CellState | null): boolean;
    /**
     * Returns the minimum width and height for editing the given state.
     */
    getMinimumSize(state: CellState): Rectangle;
    /**
     * Returns the {@link Rectangle} that defines the bounds of the editor.
     */
    getEditorBounds(state: CellState): Rectangle;
    /**
     * Returns the initial label value to be used of the label of the given
     * cell is empty. This label is displayed and cleared on the first keystroke.
     * This implementation returns <emptyLabelText>.
     *
     * @param cell <Cell> for which a text for an empty editing box should be
     * returned.
     */
    getEmptyLabelText(cell?: Cell | null): string;
    /**
     * Returns the cell that is currently being edited or null if no cell is
     * being edited.
     */
    getEditingCell(): Cell | null;
    /**
     * Destroys the editor and removes all associated resources.
     */
    onDestroy(): void;
}
export default CellEditorHandler;
