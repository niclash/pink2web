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
import GraphAbstractHierarchyCell from './GraphAbstractHierarchyCell';
import ObjectIdentity from '../../../util/ObjectIdentity';
/**
 * An abstraction of a hierarchical edge for the hierarchy layout
 *
 * Constructor: mxGraphHierarchyNode
 *
 * Constructs an internal node to represent the specified real graph cell
 *
 * Arguments:
 *
 * cell - the real graph cell this node represents
 */
class GraphHierarchyNode extends GraphAbstractHierarchyCell {
    constructor(cell) {
        super();
        /**
         * The object identities of the wrapped cells
         */
        this.ids = [];
        /**
         * Assigns a unique hashcode for each node. Used by the model dfs instead
         * of copying HashSets
         */
        this.hashCode = false;
        this.cell = cell;
        this.id = ObjectIdentity.get(cell);
        this.connectsAsTarget = [];
        this.connectsAsSource = [];
    }
    /**
     * Returns the integer value of the layer that this node resides in
     */
    getRankValue(layer) {
        return this.maxRank;
    }
    /**
     * Returns the cells this cell connects to on the next layer up
     */
    getNextLayerConnectedCells(layer) {
        if (this.nextLayerConnectedCells == null) {
            this.nextLayerConnectedCells = {};
            this.nextLayerConnectedCells[0] = [];
            for (let i = 0; i < this.connectsAsTarget.length; i += 1) {
                const edge = this.connectsAsTarget[i];
                if (edge.maxRank === -1 || edge.maxRank === layer + 1) {
                    // Either edge is not in any rank or
                    // no dummy nodes in edge, add node of other side of edge
                    this.nextLayerConnectedCells[0].push(edge.source);
                }
                else {
                    // Edge spans at least two layers, add edge
                    this.nextLayerConnectedCells[0].push(edge);
                }
            }
        }
        return this.nextLayerConnectedCells[0];
    }
    /**
     * Returns the cells this cell connects to on the next layer down
     */
    getPreviousLayerConnectedCells(layer) {
        if (this.previousLayerConnectedCells == null) {
            this.previousLayerConnectedCells = [];
            this.previousLayerConnectedCells[0] = [];
            for (let i = 0; i < this.connectsAsSource.length; i += 1) {
                const edge = this.connectsAsSource[i];
                if (edge.minRank === -1 || edge.minRank === layer - 1) {
                    // No dummy nodes in edge, add node of other side of edge
                    this.previousLayerConnectedCells[0].push(edge.target);
                }
                else {
                    // Edge spans at least two layers, add edge
                    this.previousLayerConnectedCells[0].push(edge);
                }
            }
        }
        return this.previousLayerConnectedCells[0];
    }
    /**
     * Returns true.
     */
    isVertex() {
        return true;
    }
    /**
     * Gets the value of temp for the specified layer
     */
    getGeneralPurposeVariable(layer) {
        return this.temp[0];
    }
    /**
     * Set the value of temp for the specified layer
     */
    setGeneralPurposeVariable(layer, value) {
        this.temp[0] = value;
    }
    isAncestor(otherNode) {
        // Firstly, the hash code of this node needs to be shorter than the
        // other node
        if (otherNode != null &&
            this.hashCode != null &&
            otherNode.hashCode != null &&
            this.hashCode.length < otherNode.hashCode.length) {
            if (this.hashCode === otherNode.hashCode) {
                return true;
            }
            if (this.hashCode == null || this.hashCode == null) {
                return false;
            }
            // Secondly, this hash code must match the start of the other
            // node's hash code. Arrays.equals cannot be used here since
            // the arrays are different length, and we do not want to
            // perform another array copy.
            for (let i = 0; i < this.hashCode.length; i += 1) {
                if (this.hashCode[i] !== otherNode.hashCode[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    /**
     * Gets the core vertex associated with this wrapper
     */
    getCoreCell() {
        return this.cell;
    }
}
export default GraphHierarchyNode;
