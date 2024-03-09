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
import ObjectIdentity from './ObjectIdentity';
/**
 * A wrapper class for an associative array with object keys. Note: This
 * implementation uses {@link ObjectIdentitiy} to turn object keys into strings.
 *
 * Constructor: mxEventSource
 *
 * Constructs a new dictionary which allows object to be used as keys.
 */
class Dictionary {
    constructor() {
        /**
         * Stores the (key, value) pairs in this dictionary.
         */
        this.map = {};
        this.clear();
    }
    /**
     * Clears the dictionary.
     */
    clear() {
        this.map = {};
    }
    /**
     * Returns the value for the given key.
     */
    get(key) {
        const id = ObjectIdentity.get(key);
        return this.map[id] ?? null;
    }
    /**
     * Stores the value under the given key and returns the previous
     * value for that key.
     */
    put(key, value) {
        const id = ObjectIdentity.get(key);
        const previous = this.map[id];
        this.map[id] = value;
        return previous ?? null;
    }
    /**
     * Removes the value for the given key and returns the value that
     * has been removed.
     */
    remove(key) {
        const id = ObjectIdentity.get(key);
        const previous = this.map[id];
        delete this.map[id];
        return previous ?? null;
    }
    /**
     * Returns all keys as an array.
     */
    getKeys() {
        const result = [];
        for (const key in this.map) {
            result.push(key);
        }
        return result;
    }
    /**
     * Returns all values as an array.
     */
    getValues() {
        const result = [];
        for (const key in this.map) {
            result.push(this.map[key]);
        }
        return result;
    }
    /**
     * Visits all entries in the dictionary using the given function with the
     * following signature: (key, value)=> where key is a string and
     * value is an object.
     *
     * @param visitor A function that takes the key and value as arguments.
     */
    visit(visitor) {
        for (const key in this.map) {
            visitor(key, this.map[key]);
        }
    }
}
export default Dictionary;
