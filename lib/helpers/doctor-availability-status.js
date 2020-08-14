(() => {
    "use strict";

    const Promise = require("bluebird");
    const { ObjectId } = require("mongodb");
    const doctorModuleConfig = require("../modules/doctor/config");

    const statusMessage = (status, first_name, last_name) => {
        let message = "";
        switch (status) {
            case doctorModuleConfig.status.online:
                message = `Dr. ${first_name + " " + last_name} is currently online.`;
                break;
            case doctorModuleConfig.status.offline:
                message = `Dr. ${first_name + " " + last_name} is currently offline.`;
                break;
            case doctorModuleConfig.status.oncall:
                message = `Dr. ${first_name + " " + last_name} is currently on another call.`;
                break;
            default:
                message = `Dr. ${first_name + " " + last_name} is currently unavailable.`;
                break;
        }
        return message;
    }
    module.exports = async (req, doctorUserId) => {
        try {
            const doctorDetail = await req.db.collection("Doctor").findOne({
                user_id: ObjectId(doctorUserId)
            }, { projection: { "status": true, "first_name": true, "last_name": true } })
            if (!doctorDetail) {
                return Promise.resolve({
                    success: false,
                    message: "No such Doctor Exists."
                })
            }
            return Promise.resolve({
                success: doctorDetail.status === doctorModuleConfig.status.online,
                message: statusMessage(doctorDetail.status, doctorDetail.first_name, doctorDetail.last_name)
            })
        } catch (err) {
            return Promise.resolve({
                success: false,
                message: err.message
            });
        }
    }
})()