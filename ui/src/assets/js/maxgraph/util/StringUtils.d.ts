import type { Properties } from '../types';
/**
 * Strips all whitespaces from the beginning of the string. Without the
 * second parameter, this will trim these characters:
 *
 * - " " (ASCII 32 (0x20)), an ordinary space
 * - "\t" (ASCII 9 (0x09)), a tab
 * - "\n" (ASCII 10 (0x0A)), a new line (line feed)
 * - "\r" (ASCII 13 (0x0D)), a carriage return
 * - "\0" (ASCII 0 (0x00)), the NUL-byte
 * - "\x0B" (ASCII 11 (0x0B)), a vertical tab
 */
export declare const ltrim: (str: string | null, chars?: string) => string | null;
/**
 * Strips all whitespaces from the end of the string. Without the second
 * parameter, this will trim these characters:
 *
 * - " " (ASCII 32 (0x20)), an ordinary space
 * - "\t" (ASCII 9 (0x09)), a tab
 * - "\n" (ASCII 10 (0x0A)), a new line (line feed)
 * - "\r" (ASCII 13 (0x0D)), a carriage return
 * - "\0" (ASCII 0 (0x00)), the NUL-byte
 * - "\x0B" (ASCII 11 (0x0B)), a vertical tab
 */
export declare const rtrim: (str: string | null, chars?: string) => string | null;
/**
 * Strips all whitespaces from both end of the string.
 * Without the second parameter, Javascript function will trim these
 * characters:
 *
 * - " " (ASCII 32 (0x20)), an ordinary space
 * - "\t" (ASCII 9 (0x09)), a tab
 * - "\n" (ASCII 10 (0x0A)), a new line (line feed)
 * - "\r" (ASCII 13 (0x0D)), a carriage return
 * - "\0" (ASCII 0 (0x00)), the NUL-byte
 * - "\x0B" (ASCII 11 (0x0B)), a vertical tab
 */
export declare const trim: (str: string | null, chars?: string) => string | null;
/**
 * Returns the name for the given function.
 *
 * @param f JavaScript object that represents a function.
 */
export declare const getFunctionName: (f: any) => string;
/**
 * Replaces each trailing newline with the given pattern.
 */
export declare const replaceTrailingNewlines: (str: string, pattern: string) => string;
/**
 * Removes the sibling text nodes for the given node that only consists
 * of tabs, newlines and spaces.
 *
 * @param node DOM node whose siblings should be removed.
 * @param before Optional boolean that specifies the direction of the traversal.
 */
export declare const removeWhitespace: (node: HTMLElement, before: boolean) => void;
/**
 * Replaces characters (less than, greater than, newlines and quotes) with
 * their HTML entities in the given string and returns the result.
 *
 * @param {string} s String that contains the characters to be converted.
 * @param {boolean} newline If newlines should be replaced. Default is true.
 */
export declare const htmlEntities: (s: string, newline?: boolean) => string;
export declare const getStringValue: (array: any, key: string, defaultValue: string) => string | null;
/**
 * Returns the numeric value for the given key in the given associative
 * array or the given default value (or 0) if the value is null. The value
 * is converted to a numeric value using the Number function.
 *
 * @param array Associative array that contains the value for the key.
 * @param key Key whose value should be returned.
 * @param defaultValue Value to be returned if the value for the given
 * key is null. Default is 0.
 */
export declare const getNumber: (array: any, key: string, defaultValue: number) => number;
/**
 * Returns the color value for the given key in the given associative
 * array or the given default value if the value is null. If the value
 * is {@link Constants#NONE} then null is returned.
 *
 * @param array Associative array that contains the value for the key.
 * @param key Key whose value should be returned.
 * @param defaultValue Value to be returned if the value for the given
 * key is null. Default is null.
 */
export declare const getColor: (array: any, key: string, defaultValue: any) => any;
/**
 * Returns a textual representation of the specified object.
 *
 * @param obj Object to return the string representation for.
 */
export declare const toString: (obj: Properties) => string;
