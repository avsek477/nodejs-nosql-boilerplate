((logWriter) => {
    'use strict';

    const morgan = require('morgan');

    logWriter.init = (app) => {
        // create a write stream (in append mode)
        app.use(morgan('dev')); // log every request to the console
    };

})(module.exports);
