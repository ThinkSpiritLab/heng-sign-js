import { AxiosRequestConfig } from "axios";
export declare enum PUBLIC_HEADERS_TYPE {
    content_type = "content-type",
    accesskey = "x-heng-accesskey",
    nonce = "x-heng-nonce",
    signature = "x-heng-signature",
    timestamp = "x-heng-timestamp"
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
export declare class Sign {
    private readonly encrypt;
    private readonly ak?;
    private readonly sk?;
    private readonly debug;
    constructor(encrypt: Encrypt, ak?: string, sk?: string, debug?: boolean);
    generateSign({ method, path, query, data, content_type, ak, sk, nonce, timestamp, }: SignParam): string;
    sign(config: S_AxiosRequestConfig): AxiosRequestConfig;
}
