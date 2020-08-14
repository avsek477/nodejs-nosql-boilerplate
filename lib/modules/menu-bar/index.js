(() => {
    "use strict";

    module.exports = {
        saveMenuBarItem: require("./methods/save-menubar-item"),
        getMenuItemById: require("./methods/get-menu-item-by-id"),
        getMenuItemsByRole: require("./methods/get-menu-by-roles"),
        updateMenuBarItem: require("./methods/update-menu-item"),
        deleteMenuBarItem: require("./methods/delete-menu-item")
    }
})()