(socketHelper => {
  "use strict";
  const socket = require("socket.io");
  const redisHelper = require("./redis");
  const { dbConnector } = require("./database");
  const { ObjectId } = require("mongodb");
  const { SOCKET_PORT } = require("../configs");

  var io;
  var socketServer;

  socketHelper.init = async app => {
    socketServer = require("http").Server(app);
    io = socket(socketServer, {
      path: "/socket.io"
    });

    socketServer.listen(SOCKET_PORT || 3005, () => {
      console.log(`listening to requests for socket on port ${SOCKET_PORT}`);
    });

    app.locals.io = io;

    let redisClient = await redisHelper.init(app);
    let dbClient = await dbConnector(app);

    io.on("connection", socket => {
      console.log("socket connection is made!!!", socket.id);

      socket.on("clientData", async clientData => {
        console.log("CLIENT DATA", clientData)
        await redisHelper.setDataForCache(
          { redis_cache_db: redisClient },
          clientData._id,
          clientData.clientSocketId
        );
        await redisHelper.setDataForCache(
          { redis_cache_db: redisClient },
          clientData.clientSocketId,
          clientData._id
        );
      });

      socket.on("disconnect", async status => {
        console.log("Socket id deleted", socket.id);
        // const disconnectedUserId = await redisHelper.getDataForCache({ redis_cache_db: redisClient }, socket.id, function(err){})
        // const updateResp = await dbClient.collection("Doctor").updateOne(
        //   { user_id: ObjectId(disconnectedUserId) },
        //   { $set: { status: "offline" } },
        //   // { returnNewDocument: true }
        // )
        // console.log("Doc", updateResp )
        // const newDocDetails = await dbClient.collection("Doctor").findOne({ user_id: ObjectId(disconnectedUserId) });
        // if(newDocDetails) {
        //   console.log("BROADCASTED")
        //   io.sockets.emit('docStatusBroadcast', newDocDetails);
        // }
        await redisHelper.clearCacheKeys(socket.id);
      });
    });
  };
})(module.exports);
