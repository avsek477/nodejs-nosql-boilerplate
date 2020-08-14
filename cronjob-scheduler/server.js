const CronJob = require('cron').CronJob;
const rp = require('request-promise');

const routesConfig = require('./configs/routes.config');

const makeApiRequest = (url, method) => {
    try {
        const options = {
            method: method,
            uri: url,
            json: true, // Automatically stringifies the body to JSON
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return new Promise((resolve, reject) => {
            rp(options)
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => {
                    resolve(err);
                });
        });
    } catch (err) {
        // return next(err);
    }
}

new CronJob('0 */1 * * * *', async () => {
    console.log('========================================================================================================================');
    console.log('Processing to invalidate twilio token', new Date().toLocaleString());
    console.log('========================================================================================================================');
    const data = await makeApiRequest(routesConfig.invalidate_twilio_token, 'POST');
    console.log("==response==",data);
}, null, true, 'Asia/Kathmandu');

new CronJob('*/30 * * * * *', async () => {
    console.log('========================================================================================================================');
    console.log('Processing to update doctor busy status', new Date().toLocaleString());
    console.log('========================================================================================================================');
    const data = await makeApiRequest(routesConfig.change_doc_busy_status, 'POST');
    console.log("==response==",data);
}, null, true, 'Asia/Kathmandu');