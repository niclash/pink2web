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
import Shape from '../Shape';
import { NONE } from '../../../util/Constants';
/**
 * Extends {@link Shape} to implement an cylinder shape. If a custom shape with one filled area and an overlay path is
 * needed, then this shape's {@link redrawPath} should be overridden.
 *
 * This shape is registered under {@link mxConstants.SHAPE_CYLINDER} in {@link cellRenderer}.
 */
class CylinderShape extends Shape {
    constructor(bounds, fill, stroke, strokeWidth = 1) {
        super();
        /**
         * Defines the maximum height of the top and bottom part of the cylinder shape.
         */
        this.maxHeight = 40;
        /**
         * Sets stroke tolerance to 0 for SVG.
         */
        this.svgStrokeTolerance = 0;
        this.bounds = bounds;
        this.fill = fill;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
    }
    /**
     * Redirects to redrawPath for subclasses to work.
     */
    paintVertexShape(c, x, y, w, h) {
        c.translate(x, y);
        c.begin();
        this.redrawPath(c, x, y, w, h, false);
        c.fillAndStroke();
        if (!this.outline || !this.style || !(this.style.backgroundOutline ?? false)) {
            c.setShadow(false);
            c.begin();
            this.redrawPath(c, x, y, w, h, true);
            c.stroke();
        }
    }
    /**
     * Redirects to redrawPath for subclasses to work.
     */
    getCylinderSize(x, y, w, h) {
        return Math.min(this.maxHeight, Math.round(h / 5));
    }
    /**
     * Draws the path for this shape.
     */
    redrawPath(c, x, y, w, h, isForeground = false) {
        const dy = this.getCylinderSize(x, y, w, h);
        if ((isForeground && this.fill !== NONE) || (!isForeground && this.fill === NONE)) {
            c.moveTo(0, dy);
            c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
            // Needs separate shapes for correct hit-detection
            if (!isForeground) {
                c.stroke();
                c.begin();
            }
        }
        if (!isForeground) {
            c.moveTo(0, dy);
            c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
            c.lineTo(w, h - dy);
            c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
            c.close();
        }
    }
}
export default CylinderShape;
