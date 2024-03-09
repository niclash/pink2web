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
import InternalEvent from '../event/InternalEvent';
import { fit, getScrollOrigin } from '../../util/styleUtils';
import { TOOLTIP_VERTICAL_OFFSET } from '../../util/Constants';
import { getSource, isMouseEvent } from '../../util/EventUtils';
import { isNode } from '../../util/domUtils';
/**
 * Graph event handler that displays tooltips.
 *
 * {@link Graph#getTooltip} is used to get the tooltip for a cell or handle.
 *
 * This handler is generally enabled using {@link Graph#setTooltips}.
 */
class TooltipHandler {
    /**
     * Constructs an event handler that displays tooltips.
     *
     * @param graph Reference to the enclosing {@link Graph}.
     */
    constructor(graph) {
        /**
         * Specifies the zIndex for the tooltip and its shadow.
         * @default 10005
         */
        this.zIndex = 10005;
        /**
         * Delay to show the tooltip in milliseconds.
         * @default 500
         */
        this.delay = 500;
        /**
         * Specifies if touch and pen events should be ignored.
         * @default true
         */
        this.ignoreTouchEvents = true;
        /**
         * Specifies if the tooltip should be hidden if the mouse is moved over the current cell.
         * @default false
         */
        this.hideOnHover = false;
        /**
         * `true` if this handler was destroyed using {@link onDestroy}.
         */
        this.destroyed = false;
        this.lastX = 0;
        this.lastY = 0;
        this.state = null;
        this.stateSource = false;
        this.thread = null;
        /**
         * Specifies if events are handled.
         * @default false
         */
        this.enabled = false;
        this.graph = graph;
        this.graph.addMouseListener(this);
        this.div = document.createElement('div');
        this.div.className = 'mxTooltip';
        this.div.style.visibility = 'hidden';
        document.body.appendChild(this.div);
        InternalEvent.addGestureListeners(this.div, (evt) => {
            const source = getSource(evt);
            // @ts-ignore nodeName may exist
            if (source && source.nodeName !== 'A') {
                this.hideTooltip();
            }
        });
        // Hides tooltips and resets tooltip timer if mouse leaves container
        InternalEvent.addListener(this.graph.getContainer(), 'mouseleave', (evt) => {
            if (this.div !== evt.relatedTarget) {
                this.hide();
            }
        });
    }
    /**
     * Returns `true` if events are handled.
     *
     * This implementation returns {@link enabled}.
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Enables or disables event handling.
     *
     * This implementation updates {@link enabled}.
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Returns {@link hideOnHover}.
     */
    isHideOnHover() {
        return this.hideOnHover;
    }
    /**
     * Sets <hideOnHover>.
     */
    setHideOnHover(value) {
        this.hideOnHover = value;
    }
    /**
     * Returns the <CellState> to be used for showing a tooltip for this event.
     */
    getStateForEvent(me) {
        return me.getState();
    }
    /**
     * Handles the event by initiating a rubberband selection. By consuming the
     * event all subsequent events of the gesture are redirected to this
     * handler.
     */
    mouseDown(sender, me) {
        this.reset(me, false);
        this.hideTooltip();
    }
    /**
     * Handles the event by updating the rubberband selection.
     */
    mouseMove(sender, me) {
        if (me.getX() !== this.lastX || me.getY() !== this.lastY) {
            this.reset(me, true);
            const state = this.getStateForEvent(me);
            if (this.isHideOnHover() ||
                state !== this.state ||
                (me.getSource() !== this.node &&
                    (!this.stateSource ||
                        (state != null &&
                            this.stateSource ===
                                (me.isSource(state.shape) || !me.isSource(state.text)))))) {
                this.hideTooltip();
            }
        }
        this.lastX = me.getX();
        this.lastY = me.getY();
    }
    /**
     * Handles the event by resetting the tooltip timer or hiding the existing
     * tooltip.
     */
    mouseUp(sender, me) {
        this.reset(me, true);
        this.hideTooltip();
    }
    /**
     * Resets the timer.
     */
    resetTimer() {
        if (this.thread) {
            window.clearTimeout(this.thread);
            this.thread = null;
        }
    }
    /**
     * Resets and/or restarts the timer to trigger the display of the tooltip.
     */
    reset(me, restart, state = null) {
        if (!this.ignoreTouchEvents || isMouseEvent(me.getEvent())) {
            this.resetTimer();
            state = state ?? this.getStateForEvent(me);
            if (restart &&
                this.isEnabled() &&
                state &&
                this.div.style.visibility === 'hidden') {
                const node = me.getSource();
                const x = me.getX();
                const y = me.getY();
                const stateSource = me.isSource(state.shape) || me.isSource(state.text);
                const popupMenuHandler = this.graph.getPlugin('PopupMenuHandler');
                this.thread = window.setTimeout(() => {
                    if (state &&
                        node &&
                        !this.graph.isEditing() &&
                        popupMenuHandler &&
                        !popupMenuHandler.isMenuShowing() &&
                        !this.graph.isMouseDown) {
                        // Uses information from inside event cause using the event at
                        // this (delayed) point in time is not possible in IE as it no
                        // longer contains the required information (member not found)
                        const tip = this.graph.getTooltip(state, node, x, y);
                        this.show(tip, x, y);
                        this.state = state;
                        this.node = node;
                        this.stateSource = stateSource;
                    }
                }, this.delay);
            }
        }
    }
    /**
     * Hides the tooltip and resets the timer.
     */
    hide() {
        this.resetTimer();
        this.hideTooltip();
    }
    /**
     * Hides the tooltip.
     */
    hideTooltip() {
        this.div.style.visibility = 'hidden';
        this.div.innerHTML = '';
    }
    /**
     * Shows the tooltip for the specified cell and optional index at the
     * specified location (with a vertical offset of 10 pixels).
     */
    show(tip, x, y) {
        if (!this.destroyed && tip && tip !== '') {
            const origin = getScrollOrigin();
            this.div.style.zIndex = String(this.zIndex);
            this.div.style.left = `${x + origin.x}px`;
            this.div.style.top = `${y + TOOLTIP_VERTICAL_OFFSET + origin.y}px`;
            if (!isNode(tip)) {
                this.div.innerHTML = tip.replace(/\n/g, '<br>');
            }
            else {
                this.div.innerHTML = '';
                this.div.appendChild(tip);
            }
            this.div.style.visibility = '';
            fit(this.div);
        }
    }
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy() {
        if (!this.destroyed) {
            this.graph.removeMouseListener(this);
            InternalEvent.release(this.div);
            if (this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
            }
            this.destroyed = true;
        }
    }
}
TooltipHandler.pluginId = 'TooltipHandler';
export default TooltipHandler;
