import Cell from '../cell/Cell';
import EventObject from '../event/EventObject';
import InternalMouseEvent from '../event/InternalMouseEvent';
declare module '../Graph' {
    interface Graph {
        cellsEditable: boolean;
        startEditing: (evt: MouseEvent) => void;
        startEditingAtCell: (cell: Cell | null, evt?: MouseEvent | null) => void;
        getEditingValue: (cell: Cell, evt: MouseEvent | null) => string;
        stopEditing: (cancel: boolean) => void;
        labelChanged: (cell: Cell, value: any, evt: InternalMouseEvent | EventObject) => Cell;
        cellLabelChanged: (cell: Cell, value: any, autoSize: boolean) => void;
        isEditing: (cell?: Cell | null) => boolean;
        isCellEditable: (cell: Cell) => boolean;
        isCellsEditable: () => boolean;
        setCellsEditable: (value: boolean) => void;
    }
}
