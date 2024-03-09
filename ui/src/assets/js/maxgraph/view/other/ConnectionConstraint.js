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
/**
 * Defines an object that contains the constraints about how to connect one side of an edge to its terminal.
 * @class ConnectionConstraint
 */
class ConnectionConstraint {
    constructor(point, perimeter = true, name = null, dx = 0, dy = 0) {
        /**
         * Boolean that specifies if the point should be projected onto the perimeter
         * of the terminal.
         */
        this.perimeter = true;
        /**
         * Optional string that specifies the name of the constraint.
         */
        this.name = null;
        /**
         * Optional float that specifies the horizontal offset of the constraint.
         */
        this.dx = 0;
        /**
         * Optional float that specifies the vertical offset of the constraint.
         */
        this.dy = 0;
        this.point = point;
        this.perimeter = perimeter;
        this.name = name;
        this.dx = dx;
        this.dy = dy;
    }
}
export default ConnectionConstraint;
