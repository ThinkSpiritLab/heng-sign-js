import { AxiosRequestConfig, Method } from "axios";
export interface S_AxiosRequestConfig extends AxiosRequestConfig {
    ak: string;
    sk: string;
    method: Method;
    url: string;
    params?: string | Record<string, string>;
    data?: string | Object;
}
export interface SignParam {
    method: string;
    host: string;
    path: string;
    query?: string | Object;
    data?: string | Object;
    content_type: string;
    ak: string;
    sk: string;
    nonce: string;
    timestamp: string;
}
export interface EncryptParam {
    algorithm: "SHA256" | "HmacSHA256";
    data: string;
    key?: string;
}
export interface EncryptFunction {
    (param: EncryptParam): string;
}
export declare class Sign {
    private readonly encrypt;
    constructor(encrypt: EncryptFunction);
    generateSign({ method, host, path, query, data, content_type, ak, sk, nonce, timestamp, }: SignParam): string;
    sign(config: S_AxiosRequestConfig): AxiosRequestConfig;
}
