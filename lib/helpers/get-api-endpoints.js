const listEndpoints = require('express-list-endpoints');

const init = async (app) => {
  try {
    const routeList = listEndpoints(app);
    app.locals.route_list = routeList;
    return routeList;
  } catch(err) {
    throw new Error(err);
  }
}

module.exports = { 
    init
}
