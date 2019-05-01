const WixHttpFunctionRequest = require("@wix/wix-compute-functions-sdk/lib/http-functions-request");

module.exports = ([originalUrl, method, body, headers, ip]) => [
  new WixHttpFunctionRequest(
    originalUrl,
    "_functions",
    method,
    {
      async text() {
        return body;
      },
      async JSON() {
        return JSON.parse(body);
      }
    },
    headers,
    ip
  )
];
