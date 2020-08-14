'use strict';
const fileUploadHelper = (prefixVal) => {

    const multer = require('multer');
    const multerGoogleStorage = require("multer-google-storage");
    const HTTPStatus = require('http-status');
    const messageConfig = require('../configs/message');
    const commonHelper = require('../common/common-helper-function');
    const hasher = require('../auth/hasher');

    const gcsOptsImage = {
        autoRetry: true,
        keyFilename: process.env.GCS_KEYFILE,
        maxRetries: 2,
        projectId: process.env.GCLOUD_PROJECT,
        filename: async (req, file, cb) => {
            const randomString = await hasher.generateRandomBytes(5);
            const fileName = prefixVal + '-' + Date.now() + '-' + randomString + '-' + file.originalname.replace(/ /g, '_');
            cb(null, fileName);
        },
        bucket: process.env.GCS_BUCKET
    };

    const gcsOptsDocument = {
        autoRetry: true,
        keyFilename: process.env.GCS_KEYFILE,
        maxRetries: 2,
        projectId: process.env.GCLOUD_PROJECT,
        filename: async (req, file, cb) => {
            const randomString = await hasher.generateRandomBytes(5);
            const fileName = prefixVal + '-' + Date.now() + '-' + randomString + '.' + file.originalname.replace(/ /g, '_');
            cb(null, fileName);
        },
        bucket: process.env.GCS_BUCKET
    };

    const documentFilter = (req, file, cb) => {
        // accept document files only
        if (!file.originalname.match(/\.(pdf|json|doc|docx|zip|p12)$/i)) {
            req.fileValidationError = messageConfig.uploadFile.document;
            return commonHelper.sendResponseData(req.res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.document
            });
        }
        cb(null, true);
    };

    const imageFilter = (req, file, cb) => {
        // accept image only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            req.fileValidationError = messageConfig.uploadFile.image;
            return commonHelper.sendResponseData(req.res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.image
            });
        }
        cb(null, true);
    };

    const _imageUploader = multer({
        storage: multerGoogleStorage.storageEngine(gcsOptsImage),
        fileFilter: imageFilter
    });

    const _documentUploader = multer({
        storage: multerGoogleStorage.storageEngine(gcsOptsDocument),
        fileFilter: documentFilter
    });

    const _uploader = multer({
        storage: multerGoogleStorage.storageEngine(gcsOptsDocument)
    });

    return {
        documentUploader: _documentUploader,
        imageUploader: _imageUploader,
        uploader: _uploader
    };
};

module.exports = fileUploadHelper;
