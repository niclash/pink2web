/**
 * XML HTTP request wrapper. See also: {@link mxUtils.get}, {@link mxUtils.post} and
 * {@link mxUtils.load}. This class provides a cross-browser abstraction for Ajax
 * requests.
 *
 * ### Encoding:
 *
 * For encoding parameter values, the built-in encodeURIComponent JavaScript
 * method must be used. For automatic encoding of post data in {@link Editor} the
 * {@link Editor.escapePostData} switch can be set to true (default). The encoding
 * will be carried out using the conte type of the page. That is, the page
 * containting the editor should contain a meta tag in the header, eg.
 * <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
 *
 * @example
 * ```JavaScript
 * var onload = function(req)
 * {
 *   mxUtils.alert(req.getDocumentElement());
 * }
 *
 * var onerror = function(req)
 * {
 *   mxUtils.alert('Error');
 * }
 * new MaxXmlRequest(url, 'key=value').send(onload, onerror);
 * ```
 *
 * Sends an asynchronous POST request to the specified URL.
 *
 * @example
 * ```JavaScript
 * var req = new MaxXmlRequest(url, 'key=value', 'POST', false);
 * req.send();
 * mxUtils.alert(req.getDocumentElement());
 * ```
 *
 * Sends a synchronous POST request to the specified URL.
 *
 * @example
 * ```JavaScript
 * var encoder = new Codec();
 * var result = encoder.encode(graph.getDataModel());
 * var xml = encodeURIComponent(mxUtils.getXml(result));
 * new MaxXmlRequest(url, 'xml='+xml).send();
 * ```
 *
 * Sends an encoded graph model to the specified URL using xml as the
 * parameter name. The parameter can then be retrieved in C# as follows:
 *
 * ```javascript
 * string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);
 * ```
 *
 * Or in Java as follows:
 *
 * ```javascript
 * String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8").replace("
", "&#xa;");
 * ```
 *
 * Note that the linefeeds should only be replaced if the XML is
 * processed in Java, for example when creating an image.
 */
declare class MaxXmlRequest {
    constructor(url: string, params?: string | null, method?: 'GET' | 'POST', async?: boolean, username?: string | null, password?: string | null);
    /**
     * Holds the target URL of the request.
     */
    url: string;
    /**
     * Holds the form encoded data for the POST request.
     */
    params: string | null;
    /**
     * Specifies the request method. Possible values are POST and GET. Default
     * is POST.
     */
    method: 'GET' | 'POST';
    /**
     * Boolean indicating if the request is asynchronous.
     */
    async: boolean;
    /**
     * Boolean indicating if the request is binary. This option is ignored in IE.
     * In all other browsers the requested mime type is set to
     * text/plain; charset=x-user-defined. Default is false.
     *
     * @default false
     */
    binary: boolean;
    /**
     * Specifies if withCredentials should be used in HTML5-compliant browsers. Default is false.
     *
     * @default false
     */
    withCredentials: boolean;
    /**
     * Specifies the username to be used for authentication.
     */
    username: string | null;
    /**
     * Specifies the password to be used for authentication.
     */
    password: string | null;
    /**
     * Holds the inner, browser-specific request object.
     */
    request: any;
    /**
     * Specifies if request values should be decoded as URIs before setting the
     * textarea value in {@link simulate}. Defaults to false for backwards compatibility,
     * to avoid another decode on the server this should be set to true.
     */
    decodeSimulateValues: boolean;
    /**
     * Returns {@link binary}.
     */
    isBinary(): boolean;
    /**
     * Sets {@link binary}.
     *
     * @param value
     */
    setBinary(value: boolean): void;
    /**
     * Returns the response as a string.
     */
    getText(): string;
    /**
     * Returns true if the response is ready.
     */
    isReady(): boolean;
    /**
     * Returns the document element of the response XML document.
     */
    getDocumentElement(): HTMLElement | null;
    /**
     * Returns the response as an XML document. Use {@link getDocumentElement} to get
     * the document element of the XML document.
     */
    getXml(): XMLDocument;
    /**
     * Returns the status as a number, eg. 404 for "Not found" or 200 for "OK".
     * Note: The NS_ERROR_NOT_AVAILABLE for invalid responses cannot be cought.
     */
    getStatus(): number;
    /**
     * Creates and returns the inner {@link request} object.
     */
    create(): any;
    /**
     * Send the <request> to the target URL using the specified functions to
     * process the response asychronously.
     *
     * Note: Due to technical limitations, onerror is currently ignored.
     *
     * @param onload Function to be invoked if a successful response was received.
     * @param onerror Function to be called on any error. Unused in this implementation, intended for overriden function.
     * @param timeout Optional timeout in ms before calling ontimeout.
     * @param ontimeout Optional function to execute on timeout.
     */
    send(onload?: Function | null, onerror?: Function | null, timeout?: number | null, ontimeout?: Function | null): void;
    /**
     * Sets the headers for the given request and parameters. This sets the
     * content-type to application/x-www-form-urlencoded if any params exist.
     *
     * @example
     * ```JavaScript
     * request.setRequestHeaders = function(request, params)
     * {
     *   if (params != null)
     *   {
     *     request.setRequestHeader('Content-Type',
     *             'multipart/form-data');
     *     request.setRequestHeader('Content-Length',
     *             params.length);
     *   }
     * };
     * ```
     *
     * Use the code above before calling {@link send} if you require a
     * multipart/form-data request.
     *
     * @param request
     * @param params
     */
    setRequestHeaders(request: any, params: any): void;
    /**
     * Creates and posts a request to the given target URL using a dynamically
     * created form inside the given document.
     *
     * @param doc Document that contains the form element.
     * @param target Target to send the form result to.
     */
    simulate(doc: any, target?: string | null): void;
}
/**
 * Loads the specified URL *synchronously* and returns the <MaxXmlRequest>.
 * Throws an exception if the file cannot be loaded. See {@link Utils#get} for
 * an asynchronous implementation.
 *
 * Example:
 *
 * ```javascript
 * try
 * {
 *   let req = mxUtils.load(filename);
 *   let root = req.getDocumentElement();
 *   // Process XML DOM...
 * }
 * catch (ex)
 * {
 *   mxUtils.alert('Cannot load '+filename+': '+ex);
 * }
 * ```
 *
 * @param url URL to get the data from.
 */
export declare const load: (url: string) => MaxXmlRequest;
/**
 * Loads the specified URL *asynchronously* and invokes the given functions
 * depending on the request status. Returns the <MaxXmlRequest> in use. Both
 * functions take the <MaxXmlRequest> as the only parameter. See
 * {@link Utils#load} for a synchronous implementation.
 *
 * Example:
 *
 * ```javascript
 * mxUtils.get(url, (req)=>
 * {
 *    let node = req.getDocumentElement();
 *    // Process XML DOM...
 * });
 * ```
 *
 * So for example, to load a diagram into an existing graph model, the
 * following code is used.
 *
 * ```javascript
 * mxUtils.get(url, (req)=>
 * {
 *   let node = req.getDocumentElement();
 *   let dec = new Codec(node.ownerDocument);
 *   dec.decode(node, graph.getDataModel());
 * });
 * ```
 *
 * @param url URL to get the data from.
 * @param onload Optional function to execute for a successful response.
 * @param onerror Optional function to execute on error.
 * @param binary Optional boolean parameter that specifies if the request is
 * binary.
 * @param timeout Optional timeout in ms before calling ontimeout.
 * @param ontimeout Optional function to execute on timeout.
 * @param headers Optional with headers, eg. {'Authorization': 'token xyz'}
 */
export declare const get: (url: string, onload?: Function | null, onerror?: Function | null, binary?: boolean, timeout?: number | null, ontimeout?: Function | null, headers?: {
    [key: string]: string;
} | null) => MaxXmlRequest;
/**
 * Loads the URLs in the given array *asynchronously* and invokes the given function
 * if all requests returned with a valid 2xx status. The error handler is invoked
 * once on the first error or invalid response.
 *
 * @param urls Array of URLs to be loaded.
 * @param onload Callback with array of {@link XmlRequests}.
 * @param onerror Optional function to execute on error.
 */
export declare const getAll: (urls: string[], onload: (arg0: any) => void, onerror: () => void) => void;
/**
 * Posts the specified params to the given URL *asynchronously* and invokes
 * the given functions depending on the request status. Returns the
 * <MaxXmlRequest> in use. Both functions take the <MaxXmlRequest> as the
 * only parameter. Make sure to use encodeURIComponent for the parameter
 * values.
 *
 * Example:
 *
 * ```javascript
 * mxUtils.post(url, 'key=value', (req)=>
 * {
 *   mxUtils.alert('Ready: '+req.isReady()+' Status: '+req.getStatus());
 *  // Process req.getDocumentElement() using DOM API if OK...
 * });
 * ```
 *
 * @param url URL to get the data from.
 * @param params Parameters for the post request.
 * @param onload Optional function to execute for a successful response.
 * @param onerror Optional function to execute on error.
 */
export declare const post: (url: string, params: string | null | undefined, onload: Function, onerror?: Function | null) => void;
/**
 * Submits the given parameters to the specified URL using
 * <MaxXmlRequest.simulate> and returns the <MaxXmlRequest>.
 * Make sure to use encodeURIComponent for the parameter
 * values.
 *
 * @param url URL to get the data from.
 * @param params Parameters for the form.
 * @param doc Document to create the form in.
 * @param target Target to send the form result to.
 */
export declare const submit: (url: string, params: string, doc: XMLDocument, target: string) => void;
export default MaxXmlRequest;
