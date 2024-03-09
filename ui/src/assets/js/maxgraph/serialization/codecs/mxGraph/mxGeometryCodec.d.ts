import type Codec from '../../Codec';
import ObjectCodec from '../../ObjectCodec';
export declare class mxGeometryCodec extends ObjectCodec {
    getName(): string;
    constructor();
    afterDecode(dec: Codec, node: Element | null, obj?: any): any;
}
