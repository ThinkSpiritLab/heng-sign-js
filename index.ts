import { AxiosRequestConfig } from "axios";

export enum PUBLIC_HEADERS_TYPE {
    content_type = "content-type",
    accesskey = "x-heng-accesskey",
    nonce = "x-heng-nonce",
    signature = "x-heng-signature",
    timestamp = "x-heng-timestamp",
}

export interface S_AxiosRequestConfig extends AxiosRequestConfig {
    ak?: string;
    sk?: string;
}

export interface SignParam {
    method: string;
    path: string;
    query?: unknown;
    data?: unknown;
    content_type: string;
    ak: string;
    sk: string;
    nonce: string;
    timestamp: string;
}

export interface Encrypt {
    SHA256(data: string): string;
    HmacSHA256(key: string, data: string): string;
}

/**
 * @param dict dict: string -> (string | string[])
 * @returns
 */
function toLowerCaseSortJoin(dict: Record<string, unknown>) {
    if (typeof dict !== "object") {
        throw new Error("Given dict is not Object");
    }
    const kvArray: [string, string][] = [];
    for (const key in dict) {
        kvArray.push([
            encodeURIComponent(key.toLowerCase()),
            encodeURIComponent((getVal(dict, key) ?? "").toLowerCase()),
        ]);
    }
    kvArray.sort((a, b) => {
        if (a[0] == b[0]) {
            return a[1] < b[1] ? -1 : 1;
        } else {
            return a[0] < b[0] ? -1 : 1;
        }
    });
    return kvArray.map((kv) => `${kv[0]}=${kv[1]}`).join("&");
}

/**
 * @param dict dict: string -> (string | string[])
 * @param key string
 * @returns
 */
function getVal(
    dict: Record<string, number | string | string[]>,
    key: string,
): string;
function getVal(dict: Record<string, unknown>, key: string): null;
function getVal(dict: Record<string, unknown>, key: string) {
    const val = dict[key];
    if (val === undefined) {
        return null;
    } else if (val instanceof Array) {
        if (val.length && typeof val[val.length - 1] === "string") {
            return val[val.length - 1] as string;
        }
    } else if (typeof val === "string") {
        return val;
    } else if (typeof val === "number") {
        return val.toString();
    }
    return null;
}

export class Sign {
    private readonly encrypt: Encrypt;
    private readonly ak?: string;
    private readonly sk?: string;
    private readonly debug: boolean;

    constructor(encrypt: Encrypt, ak?: string, sk?: string, debug = false) {
        this.encrypt = encrypt;
        this.ak = ak;
        this.sk = sk;
        this.debug = debug;
    }

    generateSign({
        method,
        path,
        query,
        data,
        content_type,
        ak,
        sk,
        nonce,
        timestamp,
    }: SignParam) {
        let queryStrings = undefined;
        if (query === undefined) {
            queryStrings = "";
        } else if (typeof query === "string") {
            queryStrings = query;
        } else {
            queryStrings = toLowerCaseSortJoin(
                query as Record<string, unknown>,
            );
        }

        let bodyHash = "";
        if (data === undefined || typeof data === "string") {
            // server only receive json, so "" => "{}", undefined => "{}"
            // "." => 400 Unexpected token . in JSON at position 0
            if (!data) {
                data = "{}";
            }
            bodyHash = this.encrypt.SHA256(data as string);
        } else {
            bodyHash = this.encrypt.SHA256(JSON.stringify(data));
        }

        const requestString = `${method.toUpperCase()}\n${path}\n${queryStrings}\n${toLowerCaseSortJoin(
            {
                [PUBLIC_HEADERS_TYPE.content_type]: content_type,
                [PUBLIC_HEADERS_TYPE.accesskey]: ak,
                [PUBLIC_HEADERS_TYPE.nonce]: nonce,
                [PUBLIC_HEADERS_TYPE.timestamp]: timestamp,
            },
        )}\n${bodyHash}\n`;
        if (this.debug) {
            console.log(requestString);
        }

        return this.encrypt.HmacSHA256(sk, requestString);
    }

    sign(config: S_AxiosRequestConfig): AxiosRequestConfig {
        const ak = config.ak ?? this.ak;
        const sk = config.sk ?? this.sk;
        if (ak === undefined || sk === undefined) {
            throw new Error("No ak/sk provided");
        }
        let { url } = config;
        const { method } = config;
        if (!url) {
            throw new Error("No url provided");
        }
        if (!method) {
            throw new Error("No method provided");
        }
        if (!url.startsWith("http") && config.baseURL) {
            url += config.baseURL;
        }
        url = url.replace(new RegExp("^http(s)?://"), "");
        let path = url.replace(new RegExp("([^/]*)(.*)"), "$2");
        if (!path) path = "/";

        let content_type: string;
        if (method.toUpperCase() === "GET" || config.data === undefined) {
            content_type = "";
        } else {
            content_type = "application/json;charset=utf-8";
        }

        const nonce: string = Math.random().toString();
        const timestamp: string = Math.floor(Date.now() / 1000).toString();

        if (config.headers === undefined) {
            config.headers = {};
        }
        config.headers[PUBLIC_HEADERS_TYPE.accesskey] = ak;
        config.headers[PUBLIC_HEADERS_TYPE.content_type] = content_type;
        config.headers[PUBLIC_HEADERS_TYPE.nonce] = nonce;
        config.headers[PUBLIC_HEADERS_TYPE.timestamp] = timestamp;
        config.headers[PUBLIC_HEADERS_TYPE.signature] = this.generateSign({
            method,
            path,
            query: config.params,
            data: config.data,
            content_type,
            ak,
            sk,
            nonce,
            timestamp,
        });

        delete config.ak;
        delete config.sk;

        return config;
    }
}
