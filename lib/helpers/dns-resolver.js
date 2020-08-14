((dnsResolver) => {
    'use strict';

    const dns = require('dns');
    const Promise = require("bluebird");
    const commonHelper = require("../common/common-helper-function")

    dnsResolver.resolveMailExchangeRecords = (email) => {
        return new Promise((resolve, reject) => {
            const hostname   = email.substring(email.lastIndexOf("@") +1);
            dns.resolveMx(hostname, (err, addresses) => {
                if(err) {
                    resolve(false);
                } else {
                    const resolveEmailDomainsArr = (addresses && addresses.length>0) ? addresses.map((item) => {
                        return item.exchange.substring(item.exchange.indexOf(".")+1);
                    }) : [];
                    const disposableEmails = commonHelper.getDisposableEmails();
                    const mailDomainsArr = [...new Set(resolveEmailDomainsArr)];
                    const fakeMailFound = mailDomainsArr.some((item) => disposableEmails.includes(item));
                    if(fakeMailFound) {
                        console.log('fakeMailFound', fakeMailFound, email)
                    }
                    resolve(!fakeMailFound);
                }
            });
        });

    };

    dnsResolver.checkForTemporarySuspendedEmailDomains = (email) => {
        return new Promise((resolve, reject) => {
            const hostname   = email.substring(email.lastIndexOf("@") +1);
            const temporarySuspendedEmailDomains = commonHelper.getTemporarySuspendedEmails();
            const temporarySuspendedEmailDomain = temporarySuspendedEmailDomains.filter((item) => item === hostname);
            resolve((temporarySuspendedEmailDomain && temporarySuspendedEmailDomain.length > 0) ? true : false);
        });

    };

})(module.exports);
