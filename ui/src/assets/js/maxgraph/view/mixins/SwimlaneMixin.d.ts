import Cell from '../cell/Cell';
import Rectangle from '../geometry/Rectangle';
import { CellStateStyle, DirectionValue } from '../../types';
declare module '../Graph' {
    interface Graph {
        swimlaneSelectionEnabled: boolean;
        swimlaneNesting: boolean;
        swimlaneIndicatorColorAttribute: string;
        getSwimlane: (cell: Cell | null) => Cell | null;
        getSwimlaneAt: (x: number, y: number, parent?: Cell | null) => Cell | null;
        hitsSwimlaneContent: (swimlane: Cell, x: number, y: number) => boolean;
        getStartSize: (swimlane: Cell, ignoreState?: boolean) => Rectangle;
        getSwimlaneDirection: (style: CellStateStyle) => DirectionValue;
        getActualStartSize: (swimlane: Cell, ignoreState: boolean) => Rectangle;
        isSwimlane: (cell: Cell, ignoreState?: boolean) => boolean;
        isValidDropTarget: (cell: Cell, cells?: Cell[], evt?: MouseEvent | null) => boolean;
        getDropTarget: (cells: Cell[], evt: MouseEvent, cell: Cell | null, clone?: boolean) => Cell | null;
        isSwimlaneNesting: () => boolean;
        setSwimlaneNesting: (value: boolean) => void;
        isSwimlaneSelectionEnabled: () => boolean;
        setSwimlaneSelectionEnabled: (value: boolean) => void;
    }
}
