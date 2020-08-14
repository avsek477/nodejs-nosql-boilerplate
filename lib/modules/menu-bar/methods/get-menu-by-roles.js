(() => {
    "use strict";

    const HTTPStatus = require("http-status"); 
    const commonHelper = require("../../../common/common-helper-function");
    const roleConfig = require("../../../configs/role");

    const projectionFields = {
        roles: 0
    }

    module.exports = async (req, res, next) => {
        try {
            const role = commonHelper.getLoggedInUserRole(req);
            if (role === roleConfig.superadmin) {
                const menuItems = await req.db.collection("MenuItems").find({ deleted: false }).toArray();
                return commonHelper.sendNormalResponse(res, menuItems, HTTPStatus.OK);
            }
            const menuItems = await req.db.collection("Role").aggregate([
                { $match: { "role_name": role } },
                { $addFields: { "role_id": { "$toString": "$_id" }}},
                {
                    $lookup: {
                        from: "MenuItems",
                        let: { roleId: "$role_id"},
                        pipeline: [
                            {
                                $match: {
                                    $expr: { 
                                        $and: [
                                            {$in: ["$roles", "$$roleId"]}, 
                                            {$eq: ["$deleted", false]}
                                        ]
                                    }
                                }  
                            },
                            { $project: projectionFields }
                        ]
                    }
                },
                {$unwind: '$menuItems'},
                {
                    $replaceRoot: { newRoot: "$menuItems" }
                }
            ]).toArray();

            // { $match: { "role_name": role } },
            //     { $addFields: { "role_id": { "$toString": "$_id" }}},
            //     { 
            //         $lookup: {
            //             from: "MenuItems",
            //             localField: "role_id",
            //             foreignField: "roles",
            //             as: "menuItems"
            //         }
            //     },
            //     {$unwind: '$menuItems'},
            //     {
            //         $replaceRoot: { newRoot: "$menuItems" }
            //     },
            //     { $project: projectionFields }
            return commonHelper.sendNormalResponse(res, menuItems, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    }
})()