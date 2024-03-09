import Cell from '../cell/Cell';
import Rectangle from '../geometry/Rectangle';
declare module '../Graph' {
    interface Graph {
        groupCells: (group: Cell, border: number, cells?: Cell[] | null) => Cell;
        getCellsForGroup: (cells: Cell[]) => Cell[];
        getBoundsForGroup: (group: Cell, children: Cell[], border: number | null) => Rectangle | null;
        createGroupCell: (cells: Cell[]) => Cell;
        ungroupCells: (cells?: Cell[] | null) => Cell[];
        getCellsForUngroup: () => Cell[];
        removeCellsAfterUngroup: (cells: Cell[]) => void;
        removeCellsFromParent: (cells?: Cell[] | null) => Cell[];
        updateGroupBounds: (cells: Cell[], border?: number, moveGroup?: boolean, topBorder?: number, rightBorder?: number, bottomBorder?: number, leftBorder?: number) => Cell[];
        enterGroup: (cell: Cell) => void;
        exitGroup: () => void;
    }
}
