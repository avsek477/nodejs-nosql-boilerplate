(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const unwind = require('javascript-unwind');
    const moduleConfig = require("../config");
    const commonHelper = require("../../../common/common-helper-function");

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const capitalizeFirstLetterOfEachWord = (moduleName) => {
        return moduleName.split("-").map(each => {
            return capitalizeFirstLetter(each);
        }).join(" ");
    }

    module.exports = async (req, res, next) => {
        try {
            const modules = [...new Set(req.route_list.map(el => el.path.split("/")[2]))].map(el => {return {module: el, routes: []}} );
            let groupedApiList = req.route_list.reduce((modular_routes, route)=>{
                const key = route.path.split("/")[2];
                const index = modular_routes.findIndex(el => el.module === key);
                modular_routes[index].routes.push(route);
                return modular_routes;
            }, modules)
            groupedApiList = groupedApiList.map(each => {
                return {
                    module: capitalizeFirstLetterOfEachWord(each.module),
                    routes: unwind(each.routes, "methods")
                }
            });
            return commonHelper.sendDataManipulationMessage(res, groupedApiList, moduleConfig.message.apiListFetched, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    }
})()