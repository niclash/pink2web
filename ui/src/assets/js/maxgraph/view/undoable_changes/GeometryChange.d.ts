import Geometry from '../geometry/Geometry';
import Cell from '../cell/Cell';
import GraphDataModel from '../GraphDataModel';
import type { UndoableChange } from '../../types';
/**
 * Action to change a cell's geometry in a model.
 *
 * Constructor: mxGeometryChange
 *
 * Constructs a change of a geometry in the
 * specified model.
 */
declare class GeometryChange implements UndoableChange {
    model: GraphDataModel;
    cell: Cell;
    geometry: Geometry | null;
    previous: Geometry | null;
    constructor(model: GraphDataModel, cell: Cell, geometry: Geometry | null);
    /**
     * Changes the geometry of {@link cell}` ro {@link previous}` using
     * <Transactions.geometryForCellChanged>.
     */
    execute(): void;
}
export default GeometryChange;
