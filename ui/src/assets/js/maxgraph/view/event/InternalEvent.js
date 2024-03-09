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
import InternalMouseEvent from './InternalMouseEvent';
import Client from '../../Client';
import { isConsumed, isMouseEvent } from '../../util/EventUtils';
// Checks if passive event listeners are supported
// see https://github.com/Modernizr/Modernizr/issues/1894
let supportsPassive = false;
try {
    document.addEventListener('test', () => {
        return;
    }, Object.defineProperty &&
        Object.defineProperty({}, 'passive', {
            get: () => {
                supportsPassive = true;
            },
        }));
}
catch (e) {
    // ignore
}
/**
 * @class InternalEvent
 *
 * Cross-browser DOM event support. For internal event handling,
 * {@link mxEventSource} and the graph event dispatch loop in {@link graph} are used.
 *
 * ### Memory Leaks:
 *
 * Use this class for adding and removing listeners to/from DOM nodes. The
 * {@link removeAllListeners} function is provided to remove all listeners that
 * have been added using {@link addListener}. The function should be invoked when
 * the last reference is removed in the JavaScript code, typically when the
 * referenced DOM node is removed from the DOM.
 */
class InternalEvent {
    /**
     * Binds the function to the specified event on the given element. Use
     * {@link mxUtils.bind} in order to bind the "this" keyword inside the function
     * to a given execution scope.
     */
    static addListener(element, eventName, funct) {
        element.addEventListener(eventName, funct, supportsPassive ? { passive: false } : false);
        if (!element.mxListenerList) {
            element.mxListenerList = [];
        }
        const entry = { name: eventName, f: funct };
        element.mxListenerList.push(entry);
    }
    /**
     * Removes the specified listener from the given element.
     */
    static removeListener(element, eventName, funct) {
        element.removeEventListener(eventName, funct, false);
        if (element.mxListenerList) {
            const listenerCount = element.mxListenerList.length;
            for (let i = 0; i < listenerCount; i += 1) {
                const entry = element.mxListenerList[i];
                if (entry.f === funct) {
                    element.mxListenerList.splice(i, 1);
                    break;
                }
            }
        }
    }
    /**
     * Removes all listeners from the given element.
     */
    static removeAllListeners(element) {
        const list = element.mxListenerList;
        if (list) {
            while (list.length > 0) {
                const entry = list[0];
                InternalEvent.removeListener(element, entry.name, entry.f);
            }
        }
    }
    /**
     * Adds the given listeners for touch, mouse and/or pointer events. If
     * <Client.IS_POINTER> is true then pointer events will be registered,
     * else the respective mouse events will be registered. If <Client.IS_POINTER>
     * is false and <Client.IS_TOUCH> is true then the respective touch events
     * will be registered as well as the mouse events.
     */
    static addGestureListeners(node, startListener = null, moveListener = null, endListener = null) {
        if (startListener) {
            InternalEvent.addListener(node, Client.IS_POINTER ? 'pointerdown' : 'mousedown', startListener);
        }
        if (moveListener) {
            InternalEvent.addListener(node, Client.IS_POINTER ? 'pointermove' : 'mousemove', moveListener);
        }
        if (endListener) {
            InternalEvent.addListener(node, Client.IS_POINTER ? 'pointerup' : 'mouseup', endListener);
        }
        if (!Client.IS_POINTER && Client.IS_TOUCH) {
            if (startListener) {
                InternalEvent.addListener(node, 'touchstart', startListener);
            }
            if (moveListener) {
                InternalEvent.addListener(node, 'touchmove', moveListener);
            }
            if (endListener) {
                InternalEvent.addListener(node, 'touchend', endListener);
            }
        }
    }
    /**
     * Removes the given listeners from mousedown, mousemove, mouseup and the
     * respective touch events if <Client.IS_TOUCH> is true.
     */
    static removeGestureListeners(node, startListener, moveListener, endListener) {
        if (startListener) {
            InternalEvent.removeListener(node, Client.IS_POINTER ? 'pointerdown' : 'mousedown', startListener);
        }
        if (moveListener) {
            InternalEvent.removeListener(node, Client.IS_POINTER ? 'pointermove' : 'mousemove', moveListener);
        }
        if (endListener) {
            InternalEvent.removeListener(node, Client.IS_POINTER ? 'pointerup' : 'mouseup', endListener);
        }
        if (!Client.IS_POINTER && Client.IS_TOUCH) {
            if (startListener) {
                InternalEvent.removeListener(node, 'touchstart', startListener);
            }
            if (moveListener) {
                InternalEvent.removeListener(node, 'touchmove', moveListener);
            }
            if (endListener) {
                InternalEvent.removeListener(node, 'touchend', endListener);
            }
        }
    }
    /**
     * Redirects the mouse events from the given DOM node to the graph dispatch
     * loop using the event and given state as event arguments. State can
     * either be an instance of <CellState> or a function that returns an
     * <CellState>. The down, move, up and dblClick arguments are optional
     * functions that take the trigger event as arguments and replace the
     * default behaviour.
     */
    static redirectMouseEvents(node, graph, state = null, down = null, move = null, up = null, dblClick = null) {
        const getState = (evt) => {
            return typeof state === 'function' ? state(evt) : state;
        };
        InternalEvent.addGestureListeners(node, (evt) => {
            if (down) {
                down(evt);
            }
            else if (!isConsumed(evt)) {
                graph.fireMouseEvent(InternalEvent.MOUSE_DOWN, new InternalMouseEvent(evt, getState(evt)));
            }
        }, (evt) => {
            if (move) {
                move(evt);
            }
            else if (!isConsumed(evt)) {
                graph.fireMouseEvent(InternalEvent.MOUSE_MOVE, new InternalMouseEvent(evt, getState(evt)));
            }
        }, (evt) => {
            if (up) {
                up(evt);
            }
            else if (!isConsumed(evt)) {
                graph.fireMouseEvent(InternalEvent.MOUSE_UP, new InternalMouseEvent(evt, getState(evt)));
            }
        });
        InternalEvent.addListener(node, 'dblclick', (evt) => {
            if (dblClick) {
                dblClick(evt);
            }
            else if (!isConsumed(evt)) {
                const tmp = getState(evt);
                graph.dblClick(evt, tmp?.cell);
            }
        });
    }
    /**
     * Removes the known listeners from the given DOM node and its descendants.
     *
     * @param element DOM node to remove the listeners from.
     */
    static release(element) {
        try {
            InternalEvent.removeAllListeners(element);
            // @ts-ignore
            const children = element.childNodes;
            if (children !== undefined) {
                const childCount = children.length;
                for (let i = 0; i < childCount; i += 1) {
                    InternalEvent.release(children[i]);
                }
            }
        }
        catch (e) {
            // ignores errors as this is typically called in cleanup code
        }
    }
    /**
     * Installs the given function as a handler for mouse wheel events. The
     * function has two arguments: the mouse event and a boolean that specifies
     * if the wheel was moved up or down.
     *
     * This has been tested with IE 6 and 7, Firefox (all versions), Opera and
     * Safari. It does currently not work on Safari for Mac.
     *
     * ### Example
     *
     * @example
     * ```javascript
     * mxEvent.addMouseWheelListener(function (evt, up)
     * {
     *   MaxLog.show();
     *   MaxLog.debug('mouseWheel: up='+up);
     * });
     * ```
     *
     * @param funct Handler function that takes the event argument and a boolean up
     * argument for the mousewheel direction.
     * @param target Target for installing the listener in Google Chrome. See
     * https://www.chromestatus.com/features/6662647093133312.
     */
    static addMouseWheelListener(funct, target) {
        if (funct != null) {
            const wheelHandler = (evt) => {
                // To prevent window zoom on trackpad pinch
                if (evt.ctrlKey) {
                    evt.preventDefault();
                }
                // Handles the event using the given function
                if (Math.abs(evt.deltaX) > 0.5 || Math.abs(evt.deltaY) > 0.5) {
                    funct(evt, evt.deltaY == 0 ? -evt.deltaX > 0 : -evt.deltaY > 0);
                }
            };
            target = target != null ? target : window;
            if (Client.IS_SF && !Client.IS_TOUCH) {
                let scale = 1;
                InternalEvent.addListener(target, 'gesturestart', (evt) => {
                    InternalEvent.consume(evt);
                    scale = 1;
                });
                InternalEvent.addListener(target, 'gesturechange', ((evt) => {
                    InternalEvent.consume(evt);
                    if (typeof evt.scale === 'number') {
                        const diff = scale - evt.scale;
                        if (Math.abs(diff) > 0.2) {
                            funct(evt, diff < 0, true);
                            scale = evt.scale;
                        }
                    }
                }));
                InternalEvent.addListener(target, 'gestureend', (evt) => {
                    InternalEvent.consume(evt);
                });
            }
            else {
                let evtCache = [];
                let dx0 = 0;
                let dy0 = 0;
                // Adds basic listeners for graph event dispatching
                InternalEvent.addGestureListeners(target, ((evt) => {
                    if (!isMouseEvent(evt) && evt.pointerId != null) {
                        evtCache.push(evt);
                    }
                }), ((evt) => {
                    if (!isMouseEvent(evt) && evtCache.length == 2) {
                        // Find this event in the cache and update its record with this event
                        for (let i = 0; i < evtCache.length; i += 1) {
                            if (evt.pointerId == evtCache[i].pointerId) {
                                evtCache[i] = evt;
                                break;
                            }
                        }
                        // Calculate the distance between the two pointers
                        const dx = Math.abs(evtCache[0].clientX - evtCache[1].clientX);
                        const dy = Math.abs(evtCache[0].clientY - evtCache[1].clientY);
                        const tx = Math.abs(dx - dx0);
                        const ty = Math.abs(dy - dy0);
                        if (tx > InternalEvent.PINCH_THRESHOLD ||
                            ty > InternalEvent.PINCH_THRESHOLD) {
                            const cx = evtCache[0].clientX + (evtCache[1].clientX - evtCache[0].clientX) / 2;
                            const cy = evtCache[0].clientY + (evtCache[1].clientY - evtCache[0].clientY) / 2;
                            funct(evtCache[0], tx > ty ? dx > dx0 : dy > dy0, true, cx, cy);
                            // Cache the distance for the next move event
                            dx0 = dx;
                            dy0 = dy;
                        }
                    }
                }), (evt) => {
                    evtCache = [];
                    dx0 = 0;
                    dy0 = 0;
                });
            }
            InternalEvent.addListener(target, 'wheel', wheelHandler);
        }
    }
    /**
     * Disables the context menu for the given element.
     */
    static disableContextMenu(element) {
        InternalEvent.addListener(element, 'contextmenu', (evt) => {
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            return false;
        });
    }
    /**
     * Consumes the given event.
     *
     * @param evt Native event to be consumed.
     * @param {boolean} [preventDefault=true] Optional boolean to prevent the default for the event.
     * Default is true.
     * @param {boolean} [stopPropagation=true] Option boolean to stop event propagation. Default is
     * true.
     */
    static consume(evt, preventDefault = true, stopPropagation = true) {
        if (preventDefault) {
            if (evt.preventDefault) {
                if (stopPropagation) {
                    evt.stopPropagation();
                }
                evt.preventDefault();
            }
            else if (stopPropagation) {
                evt.cancelBubble = true;
            }
        }
        // Opera
        // @ts-ignore This is a non-standard property.
        evt.isConsumed = true;
        // Other browsers
        if (!evt.preventDefault) {
            evt.returnValue = false;
        }
    }
}
//
// Special handles in mouse events
//
/**
 * Index for the label handle in an mxMouseEvent. This should be a negative
 * value that does not interfere with any possible handle indices.
 * @default -1
 */
InternalEvent.LABEL_HANDLE = -1;
/**
 * Index for the rotation handle in an mxMouseEvent. This should be a
 * negative value that does not interfere with any possible handle indices.
 * @default -2
 */
InternalEvent.ROTATION_HANDLE = -2;
/**
 * Start index for the custom handles in an mxMouseEvent. This should be a
 * negative value and is the start index which is decremented for each
 * custom handle.
 * @default -100
 */
InternalEvent.CUSTOM_HANDLE = -100;
/**
 * Start index for the virtual handles in an mxMouseEvent. This should be a
 * negative value and is the start index which is decremented for each
 * virtual handle.
 * This assumes that there are no more
 * than VIRTUAL_HANDLE - CUSTOM_HANDLE custom handles.
 *
 * @default -100000
 */
InternalEvent.VIRTUAL_HANDLE = -100000;
//
// Event names
//
/**
 * Specifies the event name for mouseDown.
 */
InternalEvent.MOUSE_DOWN = 'mouseDown';
/**
 * Specifies the event name for mouseMove.
 */
InternalEvent.MOUSE_MOVE = 'mouseMove';
/**
 * Specifies the event name for mouseUp.
 */
InternalEvent.MOUSE_UP = 'mouseUp';
/**
 * Specifies the event name for activate.
 */
InternalEvent.ACTIVATE = 'activate';
/**
 * Specifies the event name for resizeStart.
 */
InternalEvent.RESIZE_START = 'resizeStart';
/**
 * Specifies the event name for resize.
 */
InternalEvent.RESIZE = 'resize';
/**
 * Specifies the event name for resizeEnd.
 */
InternalEvent.RESIZE_END = 'resizeEnd';
/**
 * Specifies the event name for moveStart.
 */
InternalEvent.MOVE_START = 'moveStart';
/**
 * Specifies the event name for move.
 */
InternalEvent.MOVE = 'move';
/**
 * Specifies the event name for moveEnd.
 */
InternalEvent.MOVE_END = 'moveEnd';
/**
 * Specifies the event name for panStart.
 */
InternalEvent.PAN_START = 'panStart';
/**
 * Specifies the event name for pan.
 */
InternalEvent.PAN = 'pan';
/**
 * Specifies the event name for panEnd.
 */
InternalEvent.PAN_END = 'panEnd';
/**
 * Specifies the event name for minimize.
 */
InternalEvent.MINIMIZE = 'minimize';
/**
 * Specifies the event name for normalize.
 */
InternalEvent.NORMALIZE = 'normalize';
/**
 * Specifies the event name for maximize.
 */
InternalEvent.MAXIMIZE = 'maximize';
/**
 * Specifies the event name for hide.
 */
InternalEvent.HIDE = 'hide';
/**
 * Specifies the event name for show.
 */
InternalEvent.SHOW = 'show';
/**
 * Specifies the event name for close.
 */
InternalEvent.CLOSE = 'close';
/**
 * Specifies the event name for destroy.
 */
InternalEvent.DESTROY = 'destroy';
/**
 * Specifies the event name for refresh.
 */
InternalEvent.REFRESH = 'refresh';
/**
 * Specifies the event name for size.
 */
InternalEvent.SIZE = 'size';
/**
 * Specifies the event name for select.
 */
InternalEvent.SELECT = 'select';
/**
 * Specifies the event name for fired.
 */
InternalEvent.FIRED = 'fired';
/**
 * Specifies the event name for fireMouseEvent.
 */
InternalEvent.FIRE_MOUSE_EVENT = 'fireMouseEvent';
/**
 * Specifies the event name for gesture.
 */
InternalEvent.GESTURE = 'gesture';
/**
 * Specifies the event name for tapAndHold.
 */
InternalEvent.TAP_AND_HOLD = 'tapAndHold';
/**
 * Specifies the event name for get.
 */
InternalEvent.GET = 'get';
/**
 * Specifies the event name for receive.
 */
InternalEvent.RECEIVE = 'receive';
/**
 * Specifies the event name for connect.
 */
InternalEvent.CONNECT = 'connect';
/**
 * Specifies the event name for disconnect.
 */
InternalEvent.DISCONNECT = 'disconnect';
/**
 * Specifies the event name for suspend.
 */
InternalEvent.SUSPEND = 'suspend';
/**
 * Specifies the event name for suspend.
 */
InternalEvent.RESUME = 'resume';
/**
 * Specifies the event name for mark.
 */
InternalEvent.MARK = 'mark';
/**
 * Specifies the event name for root.
 */
InternalEvent.ROOT = 'root';
/**
 * Specifies the event name for post.
 */
InternalEvent.POST = 'post';
/**
 * Specifies the event name for open.
 */
InternalEvent.OPEN = 'open';
/**
 * Specifies the event name for open.
 */
InternalEvent.SAVE = 'save';
/**
 * Specifies the event name for beforeAddVertex.
 */
InternalEvent.BEFORE_ADD_VERTEX = 'beforeAddVertex';
/**
 * Specifies the event name for addVertex.
 */
InternalEvent.ADD_VERTEX = 'addVertex';
/**
 * Specifies the event name for afterAddVertex.
 */
InternalEvent.AFTER_ADD_VERTEX = 'afterAddVertex';
/**
 * Specifies the event name for done.
 */
InternalEvent.DONE = 'done';
/**
 * Specifies the event name for execute.
 */
InternalEvent.EXECUTE = 'execute';
/**
 * Specifies the event name for executed.
 */
InternalEvent.EXECUTED = 'executed';
/**
 * Specifies the event name for beginUpdate.
 */
InternalEvent.BEGIN_UPDATE = 'beginUpdate';
/**
 * Specifies the event name for startEdit.
 */
InternalEvent.START_EDIT = 'startEdit';
/**
 * Specifies the event name for endUpdate.
 */
InternalEvent.END_UPDATE = 'endUpdate';
/**
 * Specifies the event name for endEdit.
 */
InternalEvent.END_EDIT = 'endEdit';
/**
 * Specifies the event name for beforeUndo.
 */
InternalEvent.BEFORE_UNDO = 'beforeUndo';
/**
 * Specifies the event name for undo.
 */
InternalEvent.UNDO = 'undo';
/**
 * Specifies the event name for redo.
 */
InternalEvent.REDO = 'redo';
/**
 * Specifies the event name for change.
 */
InternalEvent.CHANGE = 'change';
/**
 * Specifies the event name for notify.
 */
InternalEvent.NOTIFY = 'notify';
/**
 * Specifies the event name for layoutCells.
 */
InternalEvent.LAYOUT_CELLS = 'layoutCells';
/**
 * Specifies the event name for click.
 */
InternalEvent.CLICK = 'click';
/**
 * Specifies the event name for scale.
 */
InternalEvent.SCALE = 'scale';
/**
 * Specifies the event name for translate.
 */
InternalEvent.TRANSLATE = 'translate';
/**
 * Specifies the event name for scaleAndTranslate.
 */
InternalEvent.SCALE_AND_TRANSLATE = 'scaleAndTranslate';
/**
 * Specifies the event name for up.
 */
InternalEvent.UP = 'up';
/**
 * Specifies the event name for down.
 */
InternalEvent.DOWN = 'down';
/**
 * Specifies the event name for add.
 */
InternalEvent.ADD = 'add';
/**
 * Specifies the event name for remove.
 */
InternalEvent.REMOVE = 'remove';
/**
 * Specifies the event name for clear.
 */
InternalEvent.CLEAR = 'clear';
/**
 * Specifies the event name for addCells.
 */
InternalEvent.ADD_CELLS = 'addCells';
/**
 * Specifies the event name for cellsAdded.
 */
InternalEvent.CELLS_ADDED = 'cellsAdded';
/**
 * Specifies the event name for moveCells.
 */
InternalEvent.MOVE_CELLS = 'moveCells';
/**
 * Specifies the event name for cellsMoved.
 */
InternalEvent.CELLS_MOVED = 'cellsMoved';
/**
 * Specifies the event name for resizeCells.
 */
InternalEvent.RESIZE_CELLS = 'resizeCells';
/**
 * Specifies the event name for cellsResized.
 */
InternalEvent.CELLS_RESIZED = 'cellsResized';
/**
 * Specifies the event name for toggleCells.
 */
InternalEvent.TOGGLE_CELLS = 'toggleCells';
/**
 * Specifies the event name for cellsToggled.
 */
InternalEvent.CELLS_TOGGLED = 'cellsToggled';
/**
 * Specifies the event name for orderCells.
 */
InternalEvent.ORDER_CELLS = 'orderCells';
/**
 * Specifies the event name for cellsOrdered.
 */
InternalEvent.CELLS_ORDERED = 'cellsOrdered';
/**
 * Specifies the event name for removeCells.
 */
InternalEvent.REMOVE_CELLS = 'removeCells';
/**
 * Specifies the event name for cellsRemoved.
 */
InternalEvent.CELLS_REMOVED = 'cellsRemoved';
/**
 * Specifies the event name for groupCells.
 */
InternalEvent.GROUP_CELLS = 'groupCells';
/**
 * Specifies the event name for ungroupCells.
 */
InternalEvent.UNGROUP_CELLS = 'ungroupCells';
/**
 * Specifies the event name for removeCellsFromParent.
 */
InternalEvent.REMOVE_CELLS_FROM_PARENT = 'removeCellsFromParent';
/**
 * Specifies the event name for foldCells.
 */
InternalEvent.FOLD_CELLS = 'foldCells';
/**
 * Specifies the event name for cellsFolded.
 */
InternalEvent.CELLS_FOLDED = 'cellsFolded';
/**
 * Specifies the event name for alignCells.
 */
InternalEvent.ALIGN_CELLS = 'alignCells';
/**
 * Specifies the event name for labelChanged.
 */
InternalEvent.LABEL_CHANGED = 'labelChanged';
/**
 * Specifies the event name for connectCell.
 */
InternalEvent.CONNECT_CELL = 'connectCell';
/**
 * Specifies the event name for cellConnected.
 */
InternalEvent.CELL_CONNECTED = 'cellConnected';
/**
 * Specifies the event name for splitEdge.
 */
InternalEvent.SPLIT_EDGE = 'splitEdge';
/**
 * Specifies the event name for flipEdge.
 */
InternalEvent.FLIP_EDGE = 'flipEdge';
/**
 * Specifies the event name for startEditing.
 */
InternalEvent.START_EDITING = 'startEditing';
/**
 * Specifies the event name for editingStarted.
 */
InternalEvent.EDITING_STARTED = 'editingStarted';
/**
 * Specifies the event name for editingStopped.
 */
InternalEvent.EDITING_STOPPED = 'editingStopped';
/**
 * Specifies the event name for addOverlay.
 */
InternalEvent.ADD_OVERLAY = 'addOverlay';
/**
 * Specifies the event name for removeOverlay.
 */
InternalEvent.REMOVE_OVERLAY = 'removeOverlay';
/**
 * Specifies the event name for updateCellSize.
 */
InternalEvent.UPDATE_CELL_SIZE = 'updateCellSize';
/**
 * Specifies the event name for escape.
 */
InternalEvent.ESCAPE = 'escape';
/**
 * Specifies the event name for doubleClick.
 */
InternalEvent.DOUBLE_CLICK = 'doubleClick';
/**
 * Specifies the event name for start.
 */
InternalEvent.START = 'start';
/**
 * Specifies the event name for reset.
 */
InternalEvent.RESET = 'reset';
/**
 * Threshold for pinch gestures to fire a mouse wheel event.
 * Default value is 10.
 */
InternalEvent.PINCH_THRESHOLD = 10;
export default InternalEvent;
