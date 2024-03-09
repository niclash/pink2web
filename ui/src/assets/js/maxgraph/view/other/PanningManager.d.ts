import { MouseEventListener, MouseListenerSet } from '../../types';
import { Graph } from '../Graph';
/**
 * Implements a handler for panning.
 */
declare class PanningManager {
    constructor(graph: Graph);
    /**
     * Damper value for the panning. Default is 1/6.
     */
    damper: number;
    /**
     * Delay in milliseconds for the panning. Default is 10.
     */
    delay: number;
    /**
     * Specifies if mouse events outside of the component should be handled. Default is true.
     */
    handleMouseOut: boolean;
    /**
     * Border to handle automatic panning inside the component. Default is 0 (disabled).
     */
    border: number;
    thread: number | null;
    active: boolean;
    tdx: number;
    tdy: number;
    t0x: number;
    t0y: number;
    dx: number;
    dy: number;
    scrollbars: boolean;
    scrollLeft: number;
    scrollTop: number;
    mouseListener: MouseListenerSet;
    mouseUpListener: MouseEventListener;
    stop: () => void;
    isActive: () => boolean;
    getDx: () => number;
    getDy: () => number;
    start: () => void;
    panTo: (x: number, y: number, w?: number, h?: number) => void;
    destroy: () => void;
}
export default PanningManager;
