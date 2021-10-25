"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sign = exports.PUBLIC_HEADERS_TYPE = void 0;
var PUBLIC_HEADERS_TYPE;
(function (PUBLIC_HEADERS_TYPE) {
    PUBLIC_HEADERS_TYPE["content_type"] = "content-type";
    PUBLIC_HEADERS_TYPE["accesskey"] = "x-heng-accesskey";
    PUBLIC_HEADERS_TYPE["nonce"] = "x-heng-nonce";
    PUBLIC_HEADERS_TYPE["signature"] = "x-heng-signature";
    PUBLIC_HEADERS_TYPE["timestamp"] = "x-heng-timestamp";
})(PUBLIC_HEADERS_TYPE = exports.PUBLIC_HEADERS_TYPE || (exports.PUBLIC_HEADERS_TYPE = {}));
/**
 * @param dict dict: string -> (string | string[])
 * @returns
 */
function toLowerCaseSortJoin(dict) {
    var _a;
    if (typeof dict !== "object") {
        throw new Error("Given dict is not Object");
    }
    const kvArray = [];
    for (const key in dict) {
        kvArray.push([
            encodeURIComponent(key.toLowerCase()),
            encodeURIComponent(((_a = getVal(dict, key)) !== null && _a !== void 0 ? _a : "").toLowerCase()),
        ]);
    }
    kvArray.sort((a, b) => {
        if (a[0] == b[0]) {
            return a[1] < b[1] ? -1 : 1;
        }
        else {
            return a[0] < b[0] ? -1 : 1;
        }
    });
    const dictString = kvArray
        .map((kv) => {
        return `${kv[0]}=${kv[1]}`;
    })
        .join("&");
    return dictString;
}
/**
 * @param dict dict: string -> (string | string[])
 * @param key string
 * @returns
 */
function getVal(dict, key) {
    const val = dict[key];
    if (val === undefined) {
        return null;
    }
    else if (val instanceof Array) {
        if (val.length && typeof val[val.length - 1] === "string") {
            return val[val.length - 1];
        }
    }
    else if (typeof val === "string") {
        return val;
    }
    else if (typeof val === "number") {
        return val.toString();
    }
    return null;
}
class Sign {
    constructor(encrypt, debug = false) {
        this.encrypt = encrypt;
        this.debug = debug;
    }
    generateSign({ method, path, query, data, content_type, ak, sk, nonce, timestamp, }) {
        const METHOD = method.toUpperCase();
        let queryStrings = undefined;
        if (query === undefined) {
            queryStrings = "";
        }
        else if (typeof query === "string") {
            queryStrings = query;
        }
        else {
            queryStrings = toLowerCaseSortJoin(query);
        }
        const header = {};
        header[PUBLIC_HEADERS_TYPE.content_type] = content_type;
        header[PUBLIC_HEADERS_TYPE.accesskey] = ak;
        header[PUBLIC_HEADERS_TYPE.nonce] = nonce;
        header[PUBLIC_HEADERS_TYPE.timestamp] = timestamp;
        const signedHeaders = toLowerCaseSortJoin(header);
        let bodyHash = "";
        if (data === undefined || typeof data === "string") {
            if (!data) {
                data = "{}";
            }
            bodyHash = this.encrypt({
                algorithm: "SHA256",
                data: data,
            });
        }
        else {
            bodyHash = this.encrypt({
                algorithm: "SHA256",
                data: JSON.stringify(data),
            });
        }
        const requestString = `${METHOD}\n${path}\n${queryStrings}\n${signedHeaders}\n${bodyHash}\n`;
        this.debug && console.log(requestString);
        const sign = this.encrypt({
            algorithm: "HmacSHA256",
            key: sk,
            data: requestString,
        });
        return sign;
    }
    sign(config) {
        let { url, method } = config;
        if (!url) {
            throw new Error("no url provided");
        }
        if (!method) {
            throw new Error("no method provided");
        }
        if (!url.startsWith("http") && config.baseURL) {
            url += config.baseURL;
        }
        url = url.replace(new RegExp("^http(s)?://"), "");
        let path = url.replace(new RegExp("([^/]*)(.*)"), "$2");
        if (!path)
            path = "/";
        let content_type;
        if (method.toUpperCase() === "GET" || config.data === undefined) {
            content_type = "";
        }
        else {
            content_type = "application/json;charset=utf-8";
        }
        const nonce = Math.random().toString();
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = this.generateSign({
            method,
            path,
            query: config.params,
            data: config.data,
            content_type,
            ak: config.ak,
            sk: config.sk,
            nonce,
            timestamp,
        });
        if (config.headers === undefined) {
            config.headers = {};
        }
        config.headers[PUBLIC_HEADERS_TYPE.accesskey] = config.ak;
        config.headers[PUBLIC_HEADERS_TYPE.content_type] = content_type;
        config.headers[PUBLIC_HEADERS_TYPE.nonce] = nonce;
        config.headers[PUBLIC_HEADERS_TYPE.timestamp] = timestamp;
        config.headers[PUBLIC_HEADERS_TYPE.signature] = signature;
        config.ak = "";
        config.sk = "";
        return config;
    }
}
exports.Sign = Sign;
