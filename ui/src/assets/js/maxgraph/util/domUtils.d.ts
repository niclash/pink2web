/**
 * Returns the text content of the specified node.
 *
 * @param elems DOM nodes to return the text for.
 */
export declare const extractTextWithWhitespace: (elems: Element[]) => string;
/**
 * Returns the text content of the specified node.
 *
 * @param node DOM node to return the text content for.
 */
export declare const getTextContent: (node: Text | null) => string;
/**
 * Sets the text content of the specified node.
 *
 * @param node DOM node to set the text content for.
 * @param text String that represents the text content.
 */
export declare const setTextContent: (node: HTMLElement | Text, text: string) => void;
/**
 * Returns the inner HTML for the given node as a string or an empty string
 * if no node was specified. The inner HTML is the text representing all
 * children of the node, but not the node itself.
 *
 * @param node DOM node to return the inner HTML for.
 */
export declare const getInnerHtml: (node: Element) => string;
/**
 * Returns the outer HTML for the given node as a string or an empty
 * string if no node was specified. The outer HTML is the text representing
 * all children of the node including the node itself.
 *
 * @param node DOM node to return the outer HTML for.
 */
export declare const getOuterHtml: (node: Element) => string;
/**
 * Creates a text node for the given string and appends it to the given
 * parent. Returns the text node.
 *
 * @param parent DOM node to append the text node to.
 * @param text String representing the text to be added.
 */
export declare const write: (parent: Element, text: string) => Text;
/**
 * Creates a text node for the given string and appends it to the given
 * parent with an additional linefeed. Returns the text node.
 *
 * @param parent DOM node to append the text node to.
 * @param text String representing the text to be added.
 */
export declare const writeln: (parent: Element, text: string) => Text;
/**
 * Appends a linebreak to the given parent and returns the linebreak.
 *
 * @param parent DOM node to append the linebreak to.
 */
export declare const br: (parent: Element, count?: number) => HTMLBRElement | null;
/**
 * Appends a new paragraph with the given text to the specified parent and
 * returns the paragraph.
 *
 * @param parent DOM node to append the text node to.
 * @param text String representing the text for the new paragraph.
 */
export declare const para: (parent: Element, text: string) => HTMLParagraphElement;
/**
 * Returns true if the given value is an XML node with the node name
 * and if the optional attribute has the specified value.
 *
 * This implementation assumes that the given value is a DOM node if the
 * nodeType property is numeric, that is, if isNaN returns false for
 * value.nodeType.
 *
 * @param value Object that should be examined as a node.
 * @param nodeName String that specifies the node name.
 * @param attributeName Optional attribute name to check.
 * @param attributeValue Optional attribute value to check.
 */
export declare const isNode: (value: any, nodeName?: string | null, attributeName?: string, attributeValue?: string) => boolean;
/**
 * Returns true if the given ancestor is an ancestor of the
 * given DOM node in the DOM. This also returns true if the
 * child is the ancestor.
 *
 * @param ancestor DOM node that represents the ancestor.
 * @param child DOM node that represents the child.
 */
export declare const isAncestorNode: (ancestor: Element, child: Element | null) => boolean;
/**
 * Returns an array of child nodes that are of the given node type.
 *
 * @param node Parent DOM node to return the children from.
 * @param nodeType Optional node type to return. Default is
 * {@link Constants#NODETYPE_ELEMENT}.
 */
export declare const getChildNodes: (node: Element, nodeType?: number) => ChildNode[];
/**
 * Cross browser implementation for document.importNode. Uses document.importNode
 * in all browsers but IE, where the node is cloned by creating a new node and
 * copying all attributes and children into it using importNode, recursively.
 *
 * @param doc Document to import the node into.
 * @param node Node to be imported.
 * @param allChildren If all children should be imported.
 */
export declare const importNode: (doc: Document, node: Element, allChildren: boolean) => Element;
/**
 * Full DOM API implementation for importNode without using importNode API call.
 *
 * @param doc Document to import the node into.
 * @param node Node to be imported.
 * @param allChildren If all children should be imported.
 */
export declare const importNodeImplementation: (doc: Document, node: Element, allChildren: boolean) => HTMLElement | Text | undefined;
/**
 * Clears the current selection in the page.
 */
export declare const clearSelection: () => void;
/**
 * Creates and returns an image (IMG node) or VML image (v:image) in IE6 in
 * quirks mode.
 *
 * @param src URL that points to the image to be displayed.
 */
export declare const createImage: (src: string) => HTMLImageElement;
/**
 * Adds a link node to the head of the document.
 *
 * The charset is hardcoded to `UTF-8` and the type is `text/css`.
 *
 * @param rel String that represents the rel attribute of the link node.
 * @param href String that represents the href attribute of the link node.
 * @param doc Optional parent document of the link node.
 * @param id unique id for the link element to check if it already exists
 */
export declare const addLinkToHead: (rel: string, href: string, doc?: Document | null, id?: string | null) => void;
