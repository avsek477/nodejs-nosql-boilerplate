((utilityHelper) => {
    'use strict';

    const sanitizeHtml = require('sanitize-html');
    const GithubSlugger = require('github-slugger');
    const slugger = new GithubSlugger();
    const userProfileConfig = require("../modules/user-profile/config");

    utilityHelper.getAge = (dateString) => {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    utilityHelper.getImageFileInfo = (req, imageInfo = {}, next) => {
        try {
            const fileInfo = {
                image_path: '',
                image_name: '',
                image_mimetype: '',
            };
            if (req.file && Object.keys(req.file).length > 0) {
                fileInfo.image_path = req.file.path;
                fileInfo.image_name = req.file.originalname;
                fileInfo.image_mimetype = req.file.mimetype;
            } else {
                if (imageInfo) {
                    fileInfo.image_path = imageInfo.image_path;
                    fileInfo.image_name = imageInfo.image_name;
                    fileInfo.image_mimetype = imageInfo.image_mimetype;
                }
            }
            return fileInfo;
        }
        catch (err) {
            return next(err);
        }
    };

    utilityHelper.getDocumentFileInfo = (req, docInfo = {}, next) => {
        try {
            const fileInfo = {
                document_name: '',
                document_original_name: '',
                document_mimetype: '',
            };
            if (req.file && Object.keys(req.file).length > 0) {
                fileInfo.document_name = req.file.filename;
                fileInfo.document_original_name = req.file.originalname;
                fileInfo.document_mimetype = req.file.mimetype;
            } else {
                if (docInfo) {
                    fileInfo.document_name = docInfo.document_name;
                    fileInfo.document_original_name = docInfo.document_original_name;
                    fileInfo.document_mimetype= docInfo.document_mimetype;
                }
            }
            return fileInfo;
        }
        catch (err) {
            return next(err);
        }
    };

    utilityHelper.getMultipleDocuments = (req, docLst = [], next) => {
        try {
            let documents = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(function (file) {
                    documents.push({
                        document_name: file.originalname,
                        document_path : file.path,
                        document_mimetype: file.mimetype,
                        added_on: new Date()
                    });
                });
                if (docLst) {
                    docLst.forEach(function (docInfo) {
                        if(docInfo.document_name !== undefined && docInfo.document_name!=="") {
                            documents.push({
                                document_name: docInfo.document_name,
                                document_path : docInfo.document_path,
                                document_mimetype: docInfo.document_mimetype,
                                updated_on:new Date()
                            });
                        }
                    });
                }
            } else {
                if (docLst) {
                    documents = docLst;
                }
            }
            return documents;
        } catch (err) {
            return next(err);
        }
    };

    utilityHelper.getUploadedDocuments = (req) => {
        try {
            let documents = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(function (file) {
                    documents.push({
                        document_name: file.key,
                        document_original_name : file.originalname,
                        document_mimetype: file.mimetype,
                        added_on: new Date()
                    });
                });
            }
            return documents;
        } catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.getMultipleDocumentsForBank = (req, docLst = [], next) => {
        try {
            let documents = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(function (file,index) {
                    documents.push({
                        document_name: file.key,
                        document_original_name : file.originalname,
                        document_mimetype: file.mimetype,
                        doc_type: utilityHelper.sanitizeIndividualInput(((req.body.doc_types && req.body.doc_types.length > 0 && req.body.doc_types[index]) ? req.body.doc_types[index] : ''), next),
                        added_on:new Date()
                    });
                });

                if (docLst) {
                    docLst.forEach(function (docInfo) {
                        documents.push({
                            document_name: docInfo.document_name,
                            document_original_name : docInfo.document_original_name,
                            document_mimetype: docInfo.document_mimetype,
                            doc_type:docInfo.doc_type,
                            updated_on:new Date()
                        });
                    });
                }
            } else {
                if (docLst) {
                    documents = docLst;
                }
            }
            return documents;
        } catch (err) {
            // return  next(err);
        }
    };
    utilityHelper.sanitizeUserInput = (req, next) => {
        try {
            const modelInfo = {};

            for (let i = 0, keys = Object.keys(req.body); i < keys.length; i++) {
                if (typeof req.body[keys[i]] !== 'object') {
                    modelInfo[keys[i]] = sanitizeHtml(req.body[keys[i]]).trim();
                } else if (req.body[keys[i]] instanceof Date) {
                    modelInfo[keys[i]] = req.body[keys[i]];
                } else if (req.body[keys[i]] instanceof Array) {
                    modelInfo[keys[i]] = req.body[keys[i]];
                } else {
                    modelInfo[keys[i]] = utilityHelper.sanitizeUserInput(req.body[keys[i]]);
                }
            }
            return modelInfo;
        }
        catch (err) {
            // return  next(err);
        }
    };



    utilityHelper.sanitizeIndividualInput = (bodyInput, next) => {
        try {
            return sanitizeHtml(bodyInput).trim();
        }
        catch (err) {
            // return  next(err);
        }
    };


    utilityHelper.containsChar = (stringVal, key, next) => {
        try {
            return (stringVal.indexOf(key) > -1) ? true : false;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.containsElementInArr = (array, key, next) => {
        try {
            let contains = false;
            for (let i = 0; i < array.length; i++) {
                if (array[i].trim() === key.trim()) {
                    return contains = true;
                }
            }
            return contains;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.containsElementInArrayOfObjects = (array, key, next) => {
        try {
            let contains = false;
            for (let i = 0; i < array.length; i++) {
                if (array[i].tag.trim() === key.trim()) {
                    return contains = true;
                }
            }
            return contains;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.compareValueInArrayOfObjects = (array, key, value, next) => {
        try {
            let contains = false;
            console.log('================================================')
            console.log('================================================')
            console.log('================================================')
            console.log('================================================')
            for (let i = 0; i < array.length; i++) {
                console.log('array, key, value', array, array[i], array[i][key], key, value)
                if (array[i][key] === value) {
                    return contains = true;
                }
            }
            return contains;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.trimWhiteSpaces = (str, next) => {
        try {
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.getIndexOfObject = (array, attr, value, next) => {
        try {
            for (let i = 0; i < array.length; i += 1) {
                if (array[i][attr] === value) {
                    return i;
                }
            }
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.removeElementFromArr = (array, value, next) => {
        try {
            const index = array.indexOf(value);
            if (index > -1) {
                array.splice(index, 1);
            }
            return array;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.getCleanURL = (title, next) => {
        try {
            return slugger.slug(title);
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.getFormattedDate = (date, format, next) => {
        try {

            const formattedDate = date;
            const year = formattedDate.getFullYear();
            let month = formattedDate.getMonth();
            month = parseInt(month) + 1;
            month = (month < 10) ? ('0' + month) : month;

            let day = formattedDate.getDate();
            day = (day < 10) ? ('0' + day) : day;

            return year + format + month + format + day;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.sanitizeUserHtmlBodyInput = (htmlContentInfo, next) => {
        try {
            const modelInfo = {};
            for (let i = 0, keys = Object.keys(htmlContentInfo); i < keys.length; i++) {
                if (htmlContentInfo[keys[i]] !== undefined) {
                    modelInfo[keys[i]] = sanitizeHtml(htmlContentInfo[keys[i]], {
                        allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'abbr',
                            'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'base', 'basefont',
                            'big', 'blockquote', 'br', 'h1', 'h2', 'caption', 'canvas', 'button', 'center', 'cite',
                            'code', 'colgroup', 'datalist', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'em', 'embed',
                            'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'head', 'header', 'i',
                            'iframe', 'input', 'label', 'legend', 'link', 'main', 'map', 'mark', 'menu', 'menuitem',
                            'meta', 'meter', 'nav', 'noscript', 'object', 'optgroup', 'option', 'select', 'output', 'pre',
                            'progress', 'q', 'rp', 'rt', 's', 'samp', 'section', 'small', 'source', 'span', 'strong', 'style',
                            'sub', 'summary', 'sup', 'textarea', 'tfoot', 'title', 'track', 'var', 'video'],
                        allowedAttributes: false

                    });
                } else {
                    modelInfo[keys[i]] = "";
                }
            }
            return modelInfo;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.sleep = (milliseconds) => {
        try {

            const start = new Date().getTime();
            for (let i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.isInteger = (val) => {
        const intRegex = /^\d+$/;
        return intRegex.test(val.toString());
    };

    utilityHelper.getPaginationOpts = (req, next) => {
        try {
            return {
                perPage: (req.query.perpage && utilityHelper.isInteger(req.query.perpage)) ? parseInt(req.query.perpage) : 10,
                page: (req.query.page && utilityHelper.isInteger(req.query.page)) ? parseInt(req.query.page) : 1
            };
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.getOperatingSystem = (source, next) => {
        try {
            const regExp = /\(([^\)]+)\)/;
            let matches = regExp.exec(source);
            if (matches && matches.length >= 1) {
                matches = matches[1];
                matches = matches.substring(matches.lastIndexOf(";") + 1);
            } else {
                matches = "unknown";
            }
            return matches;
        }
        catch (err) {
            // return  next(err);
        }
    };

    utilityHelper.isObject = (val) => {
        try {
            if (val === null) {
                return false;
            }
            return ( (typeof val === 'function') || (typeof val === 'object') );

        }
        catch (err) {
            //  return  next(err);
        }
    };

    utilityHelper.setMinuteFromNow = (min) => {

        let timeObject = new Date();
        timeObject.setTime(timeObject.getTime() + 1000 * 60 * parseInt(min));
        return timeObject;
    };

    utilityHelper.removeCharFromString = (val, char) => {
        return val.replace(char, '');
    };

    utilityHelper.getApplicationDeploymentPortNumber = (req) => {
        return (req.app.get('env') !== 'production') ? `${req.protocol}://${req.hostname}:${req.app.get('PORT_NUMBER')}` : `${req.protocol}://${req.headers.host}`;
    };

    utilityHelper.checkPasswordStrength = (val) => {
        // return (val && val.length >= 6 && val.length < 46) ? true : false;
        return userProfileConfig.config.passwordRegex.test(val);
        // return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,46}$/.test(val);

    };

})(module.exports);
