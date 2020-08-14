"use strict";

const express = require("express");
const HTTPStatus = require("http-status");
const bodyParser = require("body-parser");
const requestIp = require("request-ip");
const device = require("express-device");
const useragent = require("useragent");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const router = require("./lib/routes/index");
const compression = require("compression");
const logWriter = require("./lib/helpers/application-log-writer");
// const errorLogController = require('./lib/modules/error-logs/index.js');
const commonHelper = require("./lib/common/common-helper-function");
const apiEndpointHelper = require("./lib/helpers/get-api-endpoints");
const socketConnector = require("./lib/helpers/socket");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
if (dotenv.error) {
  console.log("=---dotenv.error---=", dotenv.error);
  throw dotenv.error;
}

const redisHelper = require("./lib/helpers/redis");
const { dbConnector } = require("./lib/helpers/database");
var configureAppSecurity = require("./lib/configs/security");
const messageConfig = require("./lib/configs/message");

const app = express();

if (process.env.NODE_ENV === "production") {
  //list of domains to whitelist
  const whitelist = [];
  const corsOptions = {
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  };
  app.use(cors());
} else {
  console.log("ENVIRONMENT", process.env.NODE_ENV);
  const corsOptions = {
    origin: [
      `http://localhost:${process.env.PORT}`,
      `http://localhost:${process.env.SOCKET_PORT}`,
      `http://localhost:3000`
    ]
  };
  app.use(cors());
}

redisHelper.init(app);
dbConnector(app);
socketConnector.init(app);

app.use(device.capture());

app.set("rateLimit", 100);

app.use(async (req, res, next) => {
  req.env = process.env.NODE_ENV || "development";
  if (app.locals.db) {
    req.db = app.locals.db;
  }
  if (app.locals.redis_cache_db) {
    req.redis_cache_db = app.locals.redis_cache_db;
  }
  if (app.locals.route_list) {
    req.route_list = app.locals.route_list;
  }
  if (app.locals.io) {
    req.io = app.locals.io;
    // console.log("req.io", req.io.sockets.connected(redis.));
  }
  req.root_dir = __dirname;
  global.root_dir = __dirname;
  req.client_ip_address = requestIp.getClientIp(req);
  req.client_device = req.device.type + " " + req.device.name;
  next();
});

app.set("root_dir", __dirname);
app.use(compression());

useragent(true);
logWriter.init(app);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PATCH, PUT, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Authorization,x-access-token,Accept"
  );
  // Set cache control header to eliminate cookies from cache
  res.setHeader("Cache-Control", 'no-cache="Set-Cookie, Set-Cookie2"');
  next();
});

const redisStoreOpts = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  client: redisHelper.getClient(),
  ttl: 20 * 60, // TTL of 20 minutes represented in seconds
  db: process.env.REDIS_DB,
  pass: process.env.REDIS_PASSWORD
};

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const sessionOpts = {
  store: new RedisStore(redisStoreOpts),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  maxAge: 1200000, //20 minutes
  cookie: {
    // domain: 'secure.example.com' // limit the cookie exposure
    secure: true, // set the cookie only to be served with HTTPS
    path: "/",
    httpOnly: true, // Mitigate XSS
    maxAge: null
  }
};

app.use(session(sessionOpts));

configureAppSecurity.init(app);

router.init(app);

apiEndpointHelper.init(app);

app.get("/", (req, res, next) => {
  res.send("Doctor on call server homepage...");
});

app.use((err, req, res, next) => {
  console.log("global err", err);
  if (err) {
    // errorLogController.postErrorLogs(err, req, next);
  }
  console.log(
    "================================================================================================================================================"
  );
  console.log("res.headersSent", res.headersSent);
  console.log(
    "================================================================================================================================================"
  );
  if (!res.headersSent) {
    return commonHelper.sendResponseData(res, {
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message:
        app.get("env") === "development"
          ? err.message
          : messageConfig.errorMessage.internalServerError
    });
  }
});

module.exports = app;
