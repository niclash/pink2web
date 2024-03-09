import { IdentityFunction, IdentityObject } from '../types';
type MapKey = string;
type Visitor<MapKey, U> = (key: MapKey, value: U) => void;
/**
 * A wrapper class for an associative array with object keys. Note: This
 * implementation uses {@link ObjectIdentitiy} to turn object keys into strings.
 *
 * Constructor: mxEventSource
 *
 * Constructs a new dictionary which allows object to be used as keys.
 */
declare class Dictionary<T extends IdentityObject | IdentityFunction | null, U> {
    constructor();
    /**
     * Stores the (key, value) pairs in this dictionary.
     */
    map: Record<MapKey, U>;
    /**
     * Clears the dictionary.
     */
    clear(): void;
    /**
     * Returns the value for the given key.
     */
    get(key: T): NonNullable<U> | null;
    /**
     * Stores the value under the given key and returns the previous
     * value for that key.
     */
    put(key: T, value: U): NonNullable<U> | null;
    /**
     * Removes the value for the given key and returns the value that
     * has been removed.
     */
    remove(key: T): NonNullable<U> | null;
    /**
     * Returns all keys as an array.
     */
    getKeys(): string[];
    /**
     * Returns all values as an array.
     */
    getValues(): U[];
    /**
     * Visits all entries in the dictionary using the given function with the
     * following signature: (key, value)=> where key is a string and
     * value is an object.
     *
     * @param visitor A function that takes the key and value as arguments.
     */
    visit(visitor: Visitor<MapKey, U>): void;
}
export default Dictionary;
