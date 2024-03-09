import Cell from '../cell/Cell';
declare module '../Graph' {
    interface Graph {
        dropEnabled: boolean;
        splitEnabled: boolean;
        autoScroll: boolean;
        autoExtend: boolean;
        isAutoScroll: () => boolean;
        isAutoExtend: () => boolean;
        isDropEnabled: () => boolean;
        setDropEnabled: (value: boolean) => void;
        isSplitEnabled: () => boolean;
        setSplitEnabled: (value: boolean) => void;
        isSplitTarget: (target: Cell, cells?: Cell[], evt?: MouseEvent | null) => boolean;
    }
}
