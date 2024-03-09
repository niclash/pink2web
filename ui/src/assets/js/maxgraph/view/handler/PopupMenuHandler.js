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
import MaxPopupMenu from '../../gui/MaxPopupMenu';
import InternalEvent from '../event/InternalEvent';
import { getScrollOrigin } from '../../util/styleUtils';
import { getMainEvent, isMultiTouchEvent } from '../../util/EventUtils';
/**
 * Event handler that creates popupmenus.
 *
 * Constructor: mxPopupMenuHandler
 *
 * Constructs an event handler that creates a {@link PopupMenu}.
 */
class PopupMenuHandler extends MaxPopupMenu {
    constructor(graph) {
        super();
        this.inTolerance = false;
        this.popupTrigger = false;
        /**
         * Specifies if cells should be selected if a popupmenu is displayed for
         * them. Default is true.
         */
        this.selectOnPopup = true;
        /**
         * Specifies if cells should be deselected if a popupmenu is displayed for
         * the diagram background. Default is true.
         */
        this.clearSelectionOnBackground = true;
        /**
         * X-coordinate of the mouse down event.
         */
        this.triggerX = null;
        /**
         * Y-coordinate of the mouse down event.
         */
        this.triggerY = null;
        /**
         * Screen X-coordinate of the mouse down event.
         */
        this.screenX = null;
        /**
         * Screen Y-coordinate of the mouse down event.
         */
        this.screenY = null;
        this.graph = graph;
        this.graph.addMouseListener(this);
        // Does not show menu if any touch gestures take place after the trigger
        this.gestureHandler = (sender, eo) => {
            this.inTolerance = false;
        };
        this.graph.addListener(InternalEvent.GESTURE, this.gestureHandler);
        this.init();
    }
    /**
     * Initializes the shapes required for this vertex handler.
     */
    init() {
        // Hides the tooltip if the mouse is over the context menu
        InternalEvent.addGestureListeners(this.div, (evt) => {
            const tooltipHandler = this.graph.getPlugin('TooltipHandler');
            tooltipHandler?.hide();
        });
    }
    /**
     * Hook for returning if a cell should be selected for a given {@link MouseEvent}.
     * This implementation returns <selectOnPopup>.
     */
    isSelectOnPopup(me) {
        return this.selectOnPopup;
    }
    /**
     * Handles the event by initiating the panning. By consuming the event all
     * subsequent events of the gesture are redirected to this handler.
     */
    mouseDown(sender, me) {
        if (this.isEnabled() && !isMultiTouchEvent(me.getEvent())) {
            // Hides the popupmenu if is is being displayed
            this.hideMenu();
            this.triggerX = me.getGraphX();
            this.triggerY = me.getGraphY();
            this.screenX = getMainEvent(me.getEvent()).screenX;
            this.screenY = getMainEvent(me.getEvent()).screenY;
            this.popupTrigger = this.isPopupTrigger(me);
            this.inTolerance = true;
        }
    }
    /**
     * Handles the event by updating the panning on the graph.
     */
    mouseMove(sender, me) {
        // Popup trigger may change on mouseUp so ignore it
        if (this.inTolerance && this.screenX != null && this.screenY != null) {
            if (Math.abs(getMainEvent(me.getEvent()).screenX - this.screenX) >
                this.graph.getEventTolerance() ||
                Math.abs(getMainEvent(me.getEvent()).screenY - this.screenY) >
                    this.graph.getEventTolerance()) {
                this.inTolerance = false;
            }
        }
    }
    /**
     * Handles the event by setting the translation on the view or showing the
     * popupmenu.
     */
    mouseUp(sender, me) {
        if (this.popupTrigger &&
            this.inTolerance &&
            this.triggerX != null &&
            this.triggerY != null) {
            const cell = this.getCellForPopupEvent(me);
            // Selects the cell for which the context menu is being displayed
            if (this.graph.isEnabled() &&
                this.isSelectOnPopup(me) &&
                cell != null &&
                !this.graph.isCellSelected(cell)) {
                this.graph.setSelectionCell(cell);
            }
            else if (this.clearSelectionOnBackground && cell == null) {
                this.graph.clearSelection();
            }
            // Hides the tooltip if there is one
            const tooltipHandler = this.graph.getPlugin('TooltipHandler');
            tooltipHandler?.hide();
            // Menu is shifted by 1 pixel so that the mouse up event
            // is routed via the underlying shape instead of the DIV
            const origin = getScrollOrigin();
            this.popup(me.getX() + origin.x + 1, me.getY() + origin.y + 1, cell, me.getEvent());
            me.consume();
        }
        this.popupTrigger = false;
        this.inTolerance = false;
    }
    /**
     * Hook to return the cell for the mouse up popup trigger handling.
     */
    getCellForPopupEvent(me) {
        return me.getCell();
    }
    /**
     * Destroys the handler and all its resources and DOM nodes.
     */
    onDestroy() {
        this.graph.removeMouseListener(this);
        this.graph.removeListener(this.gestureHandler);
        // Supercall
        super.destroy();
    }
}
PopupMenuHandler.pluginId = 'PopupMenuHandler';
export default PopupMenuHandler;
