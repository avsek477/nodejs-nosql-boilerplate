(() => {
    "use strict";

    const rp = require('request-promise');

    module.exports = async (request_url, headers, request_method, body={}) => {
        const options = {
            method: request_method,
            uri: request_url,
            json: true, // Automatically stringifies the body to JSON
            headers: headers,
            body: body
        };
        const response = await rp(options);
        return response;
    }
})()