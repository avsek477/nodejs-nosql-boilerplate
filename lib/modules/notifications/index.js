const notificationController = (() => {
    'use strict';

    const utilityHelper = require('../../helpers/utilities');
    const ObjectId = require('mongodb').ObjectID;
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const redisHelper = require('../../helpers/redis');
    const moduleConfig = require('./config');
    
    const defaultNotificationUrl = {
        "web": "",
        "mobile": ""
    };
    const projectionFields = {
        '_id': 1,
        'notification': 1,
        "notification_url": 1,
        'user_id': 1,
        'seen': 1,
        'read': 1,
        'added_by': 1,
        'added_on': 1
    };

    function NotificationModule() {
    }

    const _p = NotificationModule.prototype;

    _p.getAllNotifications = (req, next) => {
        const queryOpts = {
            user_id: commonHelper.getLoggedInUserId(req)
        };
        if (req.query.unread) {
            queryOpts.read = false;
        }
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const sortOpts = {
            added_on: -1
        };
        return commonProvider.getPaginatedDataList(req.db.collection('Notification'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };

    _p.getUnReadNotifications = (req, next) => {
        const queryOpts = {
            user_id: commonHelper.getLoggedInUserId(req),
            read: false
        };
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const sortOpts = {
            added_on: -1
        };
        return commonProvider.getPaginatedDataList(req.db.collection('Notification'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };

    _p.saveNotificationInfo = (req, notification_text, user_id, notification_url = defaultNotificationUrl) => {
        const notificationInfo = {
            _id: ObjectId(),
            notification: notification_text,
            notification_url: notification_url,
            user_id: user_id ? user_id.toString() : "",
            seen: false,
            read: false,
            added_by: "system",
            added_on: new Date()
        };
        redisHelper.clearDataCache(req);
        return req.db.collection('Notification').insertOne(notificationInfo);
    };
    _p.saveNotificationForMultipleUser = (req, notification_text, user_ids) => {
        const notifications = [];
        for (let i = 0; i < user_ids.length; i++) {
            notifications.push({
                _id: ObjectId(),
                notification: notification_text,
                user_id: (user_ids && user_ids.length > 0 && user_ids[i]) ? user_ids[i].toString() : "",
                seen: false,
                read: false,
                added_by: commonHelper.getLoggedInUser(req),
                added_on: new Date()
            });
        }
        redisHelper.clearDataCache(req);
        return req.db.collection('Notification').insertMany(notifications);
    };
    _p.updateNotificationSeenStatus = async (req) => {
        const queryOpts = {
            user_id: commonHelper.getLoggedInUserId(req),
            seen: false
        };
        const updateOpts = {
            $set: {
                'seen': true
            }
        };
        redisHelper.clearDataCache(req);
        return await req.db.collection('Notification').updateMany(queryOpts, updateOpts);
    };

    _p.updateNotificationReadStatus = (req) => {
        const queryOpts = {
            user_id: commonHelper.getLoggedInUserId(req),
            _id: ObjectId(req.params.notificationId)
        };
        redisHelper.clearDataCache(req);
        return req.db.collection('Notification').updateOne(queryOpts, {
            $set: {
                read: true
            }
        });
    };

    _p.hasNewNotifications = (req) => {
        const queryOpts = {
            user_id: commonHelper.getLoggedInUserId(req),
            seen: false
        };
        return req.db.collection('Notification').countDocuments(queryOpts);
    };

    _p.readAllNotifications = async (req, res, next) => {
        redisHelper.clearDataCache(req);
        const dataRes = await req.db.collection('Notification').update({
            user_id: commonHelper.getLoggedInUserId(req)
        }, {
            $set: {
                read: true
            }
        }, {
            multi: true
        });
        return commonHelper.sendResponseMessage(res, dataRes,
            {
                read_all: true
            }, moduleConfig.message.notifications_all_read
        );
    };

    return {
        getAllNotifications: _p.getAllNotifications,
        getUnReadNotifications: _p.getUnReadNotifications,
        updateNotificationSeenStatus: _p.updateNotificationSeenStatus,
        updateNotificationReadStatus: _p.updateNotificationReadStatus,
        readAllNotifications: _p.readAllNotifications,
        saveNotificationInfo: _p.saveNotificationInfo,
        hasNewNotifications: _p.hasNewNotifications,
        saveNotificationForMultipleUser: _p.saveNotificationForMultipleUser
    };

})();

module.exports = notificationController;
