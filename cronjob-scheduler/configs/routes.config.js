(() => {
    'use strict';
    const api_base = 'http://localhost:5000/api/';

    module.exports = {
        invalidate_twilio_token:`${api_base}appointment/invalidate/twilio-token`,
        change_doc_busy_status: `${api_base}appointment/doc-busy/status-update`
    };
})();
