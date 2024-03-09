import HierarchicalLayoutStage from './HierarchicalLayoutStage';
import Cell from '../../cell/Cell';
import HierarchicalLayout from '../HierarchicalLayout';
/**
 * An implementation of the first stage of the Sugiyama layout. Straightforward
 * longest path calculation of layer assignment
 *
 * Constructor: mxMinimumCycleRemover
 *
 * Creates a cycle remover for the given internal model.
 */
declare class MinimumCycleRemover extends HierarchicalLayoutStage {
    constructor(layout: HierarchicalLayout);
    /**
     * Reference to the enclosing <HierarchicalLayout>.
     */
    layout: HierarchicalLayout;
    /**
     * Takes the graph detail and configuration information within the facade
     * and creates the resulting laid out graph within that facade for further
     * use.
     */
    execute(parent: Cell): void;
}
export default MinimumCycleRemover;
