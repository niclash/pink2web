/*
Copyright 2021-present The maxGraph project Contributors
Copyright (c) 2006-2015, JGraph Ltd
Copyright (c) 2006-2015, Gaudenz Alder

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import EventSource from '../event/EventSource';
import { hasScrollbars } from '../../util/styleUtils';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import { isConsumed, isControlDown, isLeftMouseButton, isMultiTouchEvent, isPopupTrigger, isShiftDown, } from '../../util/EventUtils';
import PanningManager from '../other/PanningManager';
/**
 * Event handler that pans and creates popupmenus. To use the left
 * mousebutton for panning without interfering with cell moving and
 * resizing, use <isUseLeftButton> and <isIgnoreCell>. For grid size
 * steps while panning, use <useGrid>. This handler is built-into
 * {@link Graph#panningHandler} and enabled using {@link Graph#setPanning}.
 *
 * Constructor: mxPanningHandler
 *
 * Constructs an event handler that creates a {@link PopupMenu}
 * and pans the graph.
 *
 * Event: mxEvent.PAN_START
 *
 * Fires when the panning handler changes its <active> state to true. The
 * <code>event</code> property contains the corresponding {@link MouseEvent}.
 *
 * Event: mxEvent.PAN
 *
 * Fires while handle is processing events. The <code>event</code> property contains
 * the corresponding {@link MouseEvent}.
 *
 * Event: mxEvent.PAN_END
 *
 * Fires when the panning handler changes its <active> state to false. The
 * <code>event</code> property contains the corresponding {@link MouseEvent}.
 */
class PanningHandler extends EventSource {
    constructor(graph) {
        super();
        this.getPanningManager = () => this.panningManager;
        /**
         * Specifies if panning should be active for the left mouse button.
         * Setting this to true may conflict with {@link Rubberband}. Default is false.
         */
        this.useLeftButtonForPanning = false;
        /**
         * Specifies if {@link Event#isPopupTrigger} should also be used for panning.
         */
        this.usePopupTrigger = true;
        /**
         * Specifies if panning should be active even if there is a cell under the
         * mousepointer. Default is false.
         */
        this.ignoreCell = false;
        /**
         * Specifies if the panning should be previewed. Default is true.
         */
        this.previewEnabled = true;
        /**
         * Specifies if the panning steps should be aligned to the grid size.
         * Default is false.
         */
        this.useGrid = false;
        /**
         * Specifies if panning should be enabled. Default is false.
         */
        this.panningEnabled = false;
        /**
         * Specifies if pinch gestures should be handled as zoom. Default is true.
         */
        this.pinchEnabled = true;
        this.initialScale = 0;
        /**
         * Specifies the maximum scale. Default is 8.
         */
        this.maxScale = 8;
        /**
         * Specifies the minimum scale. Default is 0.01.
         */
        this.minScale = 0.01;
        /**
         * Holds the current horizontal offset.
         */
        this.dx = 0;
        /**
         * Holds the current vertical offset.
         */
        this.dy = 0;
        /**
         * Holds the x-coordinate of the start point.
         */
        this.startX = 0;
        /**
         * Holds the y-coordinate of the start point.
         */
        this.startY = 0;
        this.dx0 = 0;
        this.dy0 = 0;
        this.panningTrigger = false;
        this.active = false;
        this.mouseDownEvent = null;
        this.graph = graph;
        this.graph.addMouseListener(this);
        // Handles force panning event
        this.forcePanningHandler = (sender, eo) => {
            const evtName = eo.getProperty('eventName');
            const me = eo.getProperty('event');
            if (evtName === InternalEvent.MOUSE_DOWN && this.isForcePanningEvent(me)) {
                this.start(me);
                this.active = true;
                this.fireEvent(new EventObject(InternalEvent.PAN_START, { event: me }));
                me.consume();
            }
        };
        this.graph.addListener(InternalEvent.FIRE_MOUSE_EVENT, this.forcePanningHandler);
        // Handles pinch gestures
        this.gestureHandler = (sender, eo) => {
            if (this.isPinchEnabled()) {
                const evt = eo.getProperty('event');
                if (!isConsumed(evt) && evt.type === 'gesturestart') {
                    this.initialScale = this.graph.view.scale;
                    // Forces start of panning when pinch gesture starts
                    if (!this.active && this.mouseDownEvent) {
                        this.start(this.mouseDownEvent);
                        this.mouseDownEvent = null;
                    }
                }
                else if (evt.type === 'gestureend' && this.initialScale !== 0) {
                    this.initialScale = 0;
                }
                if (this.initialScale !== 0) {
                    this.zoomGraph(evt);
                }
            }
        };
        this.graph.addListener(InternalEvent.GESTURE, this.gestureHandler);
        this.mouseUpListener = () => {
            if (this.active) {
                this.reset();
            }
        };
        // Stops scrolling on every mouseup anywhere in the document
        InternalEvent.addListener(document, 'mouseup', this.mouseUpListener);
        this.panningManager = new PanningManager(graph);
    }
    /**
     * Returns true if the handler is currently active.
     */
    isActive() {
        return this.active || this.initialScale !== null;
    }
    /**
     * Returns <panningEnabled>.
     */
    isPanningEnabled() {
        return this.panningEnabled;
    }
    /**
     * Sets <panningEnabled>.
     */
    setPanningEnabled(value) {
        this.panningEnabled = value;
    }
    /**
     * Returns <pinchEnabled>.
     */
    isPinchEnabled() {
        return this.pinchEnabled;
    }
    /**
     * Sets <pinchEnabled>.
     */
    setPinchEnabled(value) {
        this.pinchEnabled = value;
    }
    /**
     * Returns true if the given event is a panning trigger for the optional
     * given cell. This returns true if control-shift is pressed or if
     * <usePopupTrigger> is true and the event is a popup trigger.
     */
    isPanningTrigger(me) {
        const evt = me.getEvent();
        return ((this.useLeftButtonForPanning && !me.getState() && isLeftMouseButton(evt)) ||
            (isControlDown(evt) && isShiftDown(evt)) ||
            (this.usePopupTrigger && isPopupTrigger(evt)));
    }
    /**
     * Returns true if the given {@link MouseEvent} should start panning. This
     * implementation always returns true if <ignoreCell> is true or for
     * multi touch events.
     */
    isForcePanningEvent(me) {
        return this.ignoreCell || isMultiTouchEvent(me.getEvent());
    }
    /**
     * Handles the event by initiating the panning. By consuming the event all
     * subsequent events of the gesture are redirected to this handler.
     */
    mouseDown(sender, me) {
        this.mouseDownEvent = me;
        if (!me.isConsumed() &&
            this.isPanningEnabled() &&
            !this.active &&
            this.isPanningTrigger(me)) {
            this.start(me);
            this.consumePanningTrigger(me);
        }
    }
    /**
     * Starts panning at the given event.
     */
    start(me) {
        this.dx0 = -this.graph.container.scrollLeft;
        this.dy0 = -this.graph.container.scrollTop;
        // Stores the location of the trigger event
        this.startX = me.getX();
        this.startY = me.getY();
        this.dx = 0;
        this.dy = 0;
        this.panningTrigger = true;
    }
    /**
     * Consumes the given {@link MouseEvent} if it was a panning trigger in
     * {@link ouseDown}. The default is to invoke {@link MouseEvent#consume}. Note that this
     * will block any further event processing. If you haven't disabled built-in
     * context menus and require immediate selection of the cell on mouseDown in
     * Safari and/or on the Mac, then use the following code:
     *
     * ```javascript
     * consumePanningTrigger(me)
     * {
     *   if (me.evt.preventDefault)
     *   {
     *     me.evt.preventDefault();
     *   }
     *
     *   // Stops event processing in IE
     *   me.evt.returnValue = false;
     *
     *   // Sets local consumed state
     *   if (!Client.IS_SF && !Client.IS_MAC)
     *   {
     *     me.consumed = true;
     *   }
     * };
     * ```
     */
    consumePanningTrigger(me) {
        me.consume();
    }
    /**
     * Handles the event by updating the panning on the graph.
     */
    mouseMove(sender, me) {
        this.dx = me.getX() - this.startX;
        this.dy = me.getY() - this.startY;
        if (this.active) {
            if (this.previewEnabled) {
                // Applies the grid to the panning steps
                if (this.useGrid) {
                    this.dx = this.graph.snap(this.dx);
                    this.dy = this.graph.snap(this.dy);
                }
                this.graph.panGraph(this.dx + this.dx0, this.dy + this.dy0);
            }
            this.fireEvent(new EventObject(InternalEvent.PAN, { event: me }));
        }
        else if (this.panningTrigger) {
            const tmp = this.active;
            // Panning is activated only if the mouse is moved
            // beyond the graph tolerance
            this.active =
                Math.abs(this.dx) > this.graph.getSnapTolerance() ||
                    Math.abs(this.dy) > this.graph.getSnapTolerance();
            if (!tmp && this.active) {
                this.fireEvent(new EventObject(InternalEvent.PAN_START, { event: me }));
            }
        }
        if (this.active || this.panningTrigger) {
            me.consume();
        }
    }
    /**
     * Handles the event by setting the translation on the view or showing the
     * popupmenu.
     */
    mouseUp(sender, me) {
        if (this.active) {
            if (this.dx !== 0 && this.dy !== 0) {
                // Ignores if scrollbars have been used for panning
                if (!this.graph.isUseScrollbarsForPanning() ||
                    !hasScrollbars(this.graph.container)) {
                    const { scale } = this.graph.getView();
                    const t = this.graph.getView().translate;
                    this.graph.panGraph(0, 0);
                    this.panGraph(t.x + this.dx / scale, t.y + this.dy / scale);
                }
                me.consume();
            }
            this.fireEvent(new EventObject(InternalEvent.PAN_END, { event: me }));
        }
        this.reset();
    }
    /**
     * Zooms the graph to the given value and consumed the event if needed.
     */
    zoomGraph(evt) {
        // @ts-ignore evt may have scale property
        let value = Math.round(this.initialScale * evt.scale * 100) / 100;
        value = Math.max(this.minScale, value);
        value = Math.min(this.maxScale, value);
        if (this.graph.view.scale !== value) {
            this.graph.zoomTo(value);
            InternalEvent.consume(evt);
        }
    }
    /**
     * Handles the event by setting the translation on the view or showing the
     * popupmenu.
     */
    reset() {
        this.panningTrigger = false;
        this.mouseDownEvent = null;
        this.active = false;
        this.dx = 0;
        this.dy = 0;
    }
    /**
     * Pans <graph> by the given amount.
     */
    panGraph(dx, dy) {
        this.graph.getView().setTranslate(dx, dy);
    }
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy() {
        this.graph.removeMouseListener(this);
        this.graph.removeListener(this.forcePanningHandler);
        this.graph.removeListener(this.gestureHandler);
        InternalEvent.removeListener(document, 'mouseup', this.mouseUpListener);
    }
}
PanningHandler.pluginId = 'PanningHandler';
export default PanningHandler;
