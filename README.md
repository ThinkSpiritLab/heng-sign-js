import

`npm install heng-sign-js --save`

example

```ts
import { Sign, EncryptParam } from "heng-sign-js";
import axios from "axios";
import * as crypto from "crypto";
function encrypt(param: EncryptParam) {
    if (param.algorithm === "SHA256") {
        return crypto
            .createHash("sha256")
            .update(param.data)
            .digest("hex");
    } else if (param.algorithm === "HmacSHA256") {
        if (!param.key) {
            throw new Error("no key provided");
        }
        return crypto
            .createHmac("sha256", param.key)
            .update(param.data)
            .digest("hex");
    }
    return "";
}

const sign = new Sign(encrypt);
const method = "post";
const url = "http://127.0.0.1:8080/v1/judger/token";
const query = {};
const ak =
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const sk =
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const data = { maxTaskCount: 1 };
axios.request(
    sign.sign({
        method,
        url,
        params: query,
        data,
        ak,
        sk
    })
);
```