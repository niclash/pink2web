import HierarchicalLayoutStage from './HierarchicalLayoutStage';
import Cell from '../../../view/cell/Cell';
import SwimlaneLayout from '../SwimlaneLayout';
/**
 * An implementation of the first stage of the Sugiyama layout. Straightforward
 * longest path calculation of layer assignment
 *
 * Constructor: SwimlaneOrdering
 *
 * Creates a cycle remover for the given internal model.
 */
declare class SwimlaneOrdering extends HierarchicalLayoutStage {
    constructor(layout: SwimlaneLayout);
    /**
     * Reference to the enclosing <HierarchicalLayout>.
     */
    layout: SwimlaneLayout;
    /**
     * Takes the graph detail and configuration information within the facade
     * and creates the resulting laid out graph within that facade for further
     * use.
     */
    execute(parent: Cell): void;
}
export default SwimlaneOrdering;
