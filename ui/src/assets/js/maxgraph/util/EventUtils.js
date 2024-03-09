/*
Copyright 2021-present The maxGraph project Contributors

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
import Client from '../Client';
/**
 * Returns the touch or mouse event that contains the mouse coordinates.
 */
export const getMainEvent = (evt) => {
    let t = evt;
    if ((t.type === 'touchstart' || t.type === 'touchmove') && t.touches && t.touches[0]) {
        t = t.touches[0];
    }
    else if (t.type === 'touchend' && t.changedTouches && t.changedTouches[0]) {
        t = t.changedTouches[0];
    }
    return t;
};
/**
 * Returns true if the meta key is pressed for the given event.
 */
export const getClientX = (evt) => {
    return getMainEvent(evt).clientX;
};
/**
 * Returns true if the meta key is pressed for the given event.
 */
// static getClientY(e: TouchEvent | MouseEvent): number;
export const getClientY = (evt) => {
    return getMainEvent(evt).clientY;
};
/**
 * Returns the event's target or srcElement depending on the browser.
 */
export const getSource = (evt) => {
    return evt.target;
};
/**
 * Returns true if the event has been consumed using {@link consume}.
 */
export const isConsumed = (evt) => {
    const t = evt;
    return t.isConsumed !== undefined && t.isConsumed;
};
/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
export const isTouchEvent = (evt) => {
    const t = evt;
    return t.pointerType
        ? t.pointerType === 'touch' || t.pointerType === t.MSPOINTER_TYPE_TOUCH
        : t.mozInputSource !== undefined
            ? t.mozInputSource === 5
            : t.type.indexOf('touch') === 0;
};
/**
 * Returns true if the event was generated using a pen (not a touch device or mouse).
 */
export const isPenEvent = (evt) => {
    const t = evt;
    return t.pointerType
        ? t.pointerType == 'pen' || t.pointerType === t.MSPOINTER_TYPE_PEN
        : t.mozInputSource !== undefined
            ? t.mozInputSource === 2
            : t.type.indexOf('pen') === 0;
};
/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
export const isMultiTouchEvent = (evt) => {
    const t = evt;
    return (t.type &&
        t.type.indexOf('touch') == 0 &&
        t.touches !== undefined &&
        t.touches.length > 1);
};
/**
 * Returns true if the event was generated using a mouse (not a pen or touch device).
 */
export const isMouseEvent = (evt) => {
    const t = evt;
    return t.pointerType
        ? t.pointerType == 'mouse' || t.pointerType === t.MSPOINTER_TYPE_MOUSE
        : t.mozInputSource !== undefined
            ? t.mozInputSource === 1
            : t.type.indexOf('mouse') === 0;
};
/**
 * Returns true if the left mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property. Note that this returns true in Firefox
 * for control+left-click on the Mac.
 */
// static isLeftMouseButton(evt: MouseEvent): boolean;
export const isLeftMouseButton = (evt) => {
    // Special case for mousemove and mousedown we check the buttons
    // if it exists because which is 0 even if no button is pressed
    if ('buttons' in evt && (evt.type === 'mousedown' || evt.type === 'mousemove')) {
        return evt.buttons === 1;
    }
    if (evt.which !== undefined) {
        return evt.which === 1;
    }
    return evt.button === 1;
};
/**
 * Returns true if the middle mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property.
 */
export const isMiddleMouseButton = (evt) => {
    return evt.button === 4;
};
/**
 * Returns true if the right mouse button was pressed. Note that this
 * button might not be available on some systems. For handling a popup
 * trigger {@link isPopupTrigger} should be used.
 */
export const isRightMouseButton = (evt) => {
    return evt.button === 2;
};
/**
 * Returns true if the event is a popup trigger. This implementation
 * returns true if the right button or the left button and control was
 * pressed on a Mac.
 */
export const isPopupTrigger = (evt) => {
    return (isRightMouseButton(evt) ||
        (Client.IS_MAC &&
            isControlDown(evt) &&
            !isShiftDown(evt) &&
            !isMetaDown(evt) &&
            !isAltDown(evt)));
};
/**
 * Returns true if the shift key is pressed for the given event.
 */
export const isShiftDown = (evt) => {
    return evt.shiftKey;
};
/**
 * Returns true if the alt key is pressed for the given event.
 */
export const isAltDown = (evt) => {
    return evt.altKey;
};
/**
 * Returns true if the control key is pressed for the given event.
 */
export const isControlDown = (evt) => {
    return evt.ctrlKey;
};
/**
 * Returns true if the meta key is pressed for the given event.
 */
export const isMetaDown = (evt) => {
    return evt.metaKey;
};
