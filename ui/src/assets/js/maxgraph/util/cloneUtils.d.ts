/**
 * Recursively clones the specified object ignoring all fieldnames in the
 * given array of transient fields. {@link ObjectIdentity#FIELD_NAME} is always
 * ignored by this function.
 *
 * @param obj Object to be cloned.
 * @param transients Optional array of strings representing the fieldname to be
 * ignored.
 * @param shallow Optional boolean argument to specify if a shallow clone should
 * be created, that is, one where all object references are not cloned or,
 * in other words, one where only atomic (strings, numbers) values are
 * cloned. Default is false.
 */
export declare const clone: (obj: any, transients?: string[] | null, shallow?: boolean) => any;
