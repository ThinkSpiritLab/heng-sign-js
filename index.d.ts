import { AxiosRequestConfig } from "axios";
export interface S_AxiosRequestConfig extends AxiosRequestConfig {
    ak: string;
    sk: string;
}
export interface SignParam {
    method: string;
    path: string;
    query?: any;
    data?: any;
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
    private readonly debug;
    constructor(encrypt: EncryptFunction, debug?: boolean);
    generateSign({ method, path, query, data, content_type, ak, sk, nonce, timestamp, }: SignParam): string;
    sign(config: S_AxiosRequestConfig): AxiosRequestConfig;
}
