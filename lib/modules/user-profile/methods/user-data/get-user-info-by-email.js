(() => {
    "use strict";

    module.exports = async (req, email) => {
        try {
            const queryOpts = {
                email: email,
                deleted: false
            };
            return req.db.collection('User').findOne(queryOpts);
        } catch(err) {
            return next(err);
        }
    }
})()