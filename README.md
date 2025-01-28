#### import

`npm install heng-sign-js --save`

#### example

```ts
import { Sign, Encrypt } from "heng-sign-js";
import axios from "axios";
import * as crypto from "crypto";

const encrypt: Encrypt = {
    SHA256(data: string): string {
        return crypto.createHash("sha256").update(data).digest("hex");
    },
    HmacSHA256(key: string, data: string): string {
        return crypto.createHmac("sha256", key).update(data).digest("hex");
    },
};

const sign = new Sign(encrypt, undefined, undefined, true);
const method = "post";
const url = "http://127.0.0.1:8080/v1/judger/token";
const query = {};
const ak = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const sk = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const data = { maxTaskCount: 1 };
axios.request(
    sign.sign({
        method,
        url,
        params: query,
        data,
        ak,
        sk,
    }),
);
```

or

```ts
const ak = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const sk = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const sign = new Sign(encrypt, ak, sk, true);

const instance = axios.create();
instance.interceptors.request.use(sign.sign);

const method = "post";
const url = "http://127.0.0.1:8080/v1/judger/token";
const query = {};
const data = { maxTaskCount: 1 };

instance.post(url, data, {
    params: query,
});

// or

instance.request({
    method,
    url,
    params: query,
    data,
});
```
