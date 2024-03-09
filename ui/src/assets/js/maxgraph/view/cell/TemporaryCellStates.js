/*
Copyright 2021-present The maxGraph project Contributors
Copyright (c) 2006-2017, JGraph Ltd
Copyright (c) 2006-2017, Gaudenz Alder

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
import Rectangle from '../geometry/Rectangle';
import Dictionary from '../../util/Dictionary';
/**
 * Creates a temporary set of cell states.
 */
class TemporaryCellStates {
    constructor(view, scale = 1, cells, isCellVisibleFn = null, getLinkForCellState = null) {
        this.view = view;
        // Stores the previous state
        this.oldValidateCellState = view.validateCellState;
        this.oldBounds = view.getGraphBounds();
        this.oldStates = view.getStates();
        this.oldScale = view.getScale();
        this.oldDoRedrawShape = view.graph.cellRenderer.doRedrawShape;
        const self = this;
        // Overrides doRedrawShape and paint shape to add links on shapes
        if (getLinkForCellState != null) {
            view.graph.cellRenderer.doRedrawShape = (state) => {
                const shape = state?.shape;
                const oldPaint = shape.paint;
                shape.paint = (c) => {
                    const link = getLinkForCellState(state);
                    if (link != null) {
                        c.setLink(link);
                    }
                    oldPaint.apply(this, [c]);
                    if (link != null) {
                        c.setLink(null);
                    }
                };
                self.oldDoRedrawShape.apply(view.graph.cellRenderer, [
                    state,
                ]);
                shape.paint = oldPaint;
            };
        }
        // Overrides validateCellState to ignore invisible cells
        view.validateCellState = (cell, recurse) => {
            if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell)) {
                return self.oldDoRedrawShape.apply(view, [cell, recurse]);
            }
            return null;
        };
        // Creates space for new states
        view.setStates(new Dictionary());
        view.setScale(scale);
        view.resetValidationState();
        let bbox = null;
        // Validates the vertices and edges without adding them to
        // the model so that the original cells are not modified
        for (const cell of cells) {
            const bounds = view.getBoundingBox(view.validateCellState(view.validateCell(cell)));
            if (bbox == null) {
                bbox = bounds;
            }
            else {
                bbox.add(bounds);
            }
        }
        view.setGraphBounds(bbox || new Rectangle());
    }
    destroy() {
        const view = this.view;
        view.setScale(this.oldScale);
        view.setStates(this.oldStates);
        view.setGraphBounds(this.oldBounds);
        // @ts-ignore
        view.validateCellState = this.oldValidateCellState;
        // @ts-ignore
        view.graph.cellRenderer.doRedrawShape = this.oldDoRedrawShape;
    }
}
export default TemporaryCellStates;
