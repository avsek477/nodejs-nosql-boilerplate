/**
 * Created by lakhe on 6/27/17.
 */
(redisHelper => {
  "use strict";

  const redis = require("redis");
  const client = redis.createClient(
    +process.env.REDIS_PORT,
    process.env.REDIS_HOST,
    { no_ready_check: true }
  );
  const Promise = require("bluebird");
  const Redlock = require("redlock");

  redisHelper.init = app => {
    return new Promise((resolve, reject) => {
      client.auth(process.env.REDIS_PASSWORD, err => {
        if (err) throw err;
      });
      //    client.select(1,(err,res)=>{
      //        if(!err)
      //            console.log("conenct redis db 1 -- ", res)
      //    })
      client.on("ready", () => {
        console.log("Ready to connect to Redis database...");
      });

      client.on("connect", () => {
        console.log("Connected to Redis database...");
        app.locals.redis_cache_db = client;
        resolve(client);
      });

      client.on("error", function(err) {
        console.log("Error " + err);
        reject(err);
      });
    });
  };

  redisHelper.generateUniqueCacheKey = req => {
    return `${req.baseUrl}${req.url}`;
  };

  redisHelper.setDataForCache = (req, key, data) => {
    return new Promise((resolve, reject) => {
      const storeData = typeof data === "string" ? data : JSON.stringify(data);
      req.redis_cache_db.setex(
        key,
        (parseInt(process.env.REDIS_CACHE_EXPIRES_IN) * 60 * 60),
        storeData
      );
      console.log("data saved to cache");
      resolve(true);
    });
  };

  redisHelper.setHashKeyData = (req, key, field, data) => {
    const storeData = typeof data === "string" ? data : JSON.stringify(data);
    req.redis_cache_db.hset(
      key,
      field,
      storeData
    )
  }

  redisHelper.getHashKeyData = (req, key, field, next) => {
    return new Promise((resolve, reject) => {
      req.redis_cache_db.hget(key, field, (err, data) => {
        if (!err && data !== null) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  }

  redisHelper.getDataForCache = (req, key, next) => {
    return new Promise((resolve, reject) => {
      req.redis_cache_db.get(key, (err, data) => {
        if (!err && data !== null) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  };

  redisHelper.getCachedObjectData = (req, res, next) => {
    console.log("getting data from cache");
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    req.redis_cache_db.get(_keyData, (err, data) => {
      if (!err && data !== null) {
        console.log("found data on cache");
        //return commonHelper.sendJsonResponse(res, JSON.parse(data), '', HTTPStatus.OK)
        return res.status(200).json(JSON.parse(data));
      } else {
        next();
      }
    });
  };

  redisHelper.getCachedObjectDataInternal = (req, res, next) => {
    console.log("getting data from cache");
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    req.redis_cache_db.get(_keyData, (err, data) => {
      if (!err && data !== null) {
        console.log("found data on cache");
        //return commonHelper.sendJsonResponse(res, JSON.parse(data), '', HTTPStatus.OK)
        return JSON.parse(data);
      } else {
        return JSON.parse({});
      }
    });
  };

  redisHelper.getCachedStringData = (req, res, next) => {
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    req.redis_cache_db.get(_keyData, (err, data) => {
      if (!err && data !== null) {
        //return commonHelper.sendJsonResponse(res, data, '', HTTPStatus.OK)
        return res.status(200).json(data);
      } else {
        next();
      }
    });
  };

  redisHelper.getClient = () => {
    return client;
  };

  redisHelper.setDataToCache = (req, data, ttl) => {
    const time_to_set = process.env.REDIS_CACHE_EXPIRES_IN;
    console.log("setting data to cache", time_to_set);
    const redisTTL = ttl ? ttl : 3600;
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    const storeData = typeof data === "string" ? data : JSON.stringify(data);
    console.log("storeData", typeof storeData, storeData);
    req.redis_cache_db.setex(_keyData, redisTTL, storeData);
  };

  redisHelper.scanRedisKeys = (req, cursor, returnKeys) => {
    req.redis_cache_db.scan(
      cursor,
      "MATCH",
      `${req.baseUrl}*`,
      "COUNT",
      "1",
      (err, res) => {
        if (!err) {
          cursor = res[0];
          const cache_keys = res[1];
          cache_keys.forEach(key => {
            returnKeys.push(key);
          });
          if (cache_keys.length > 0) {
            console.log("Array of matching keys", cache_keys);
          }
          if (cursor === "0") {
            return redisHelper.clearCacheKeys(returnKeys);
          }
        } else {
          return Promise.resolve([]);
        }

        return redisHelper.scanRedisKeys(req, cursor, returnKeys);
      }
    );
  };

  redisHelper.clearDataCache = async req => {
    // Delete cached model data
    let cursor = "0";
    let returnKeys = [];
    redisHelper.scanRedisKeys(req, cursor, returnKeys);
  };

  redisHelper.clearCacheKeys = keys => {
    client.del(keys, err => {
      if (!err) {
        console.log("keys cleared from the redis db...");
      }
      return;
    });
  };

  redisHelper.getSetCachedData = async (req, key, value, method) => {
    return new Promise((resolve, reject) => {
      req.redis_cache_db.get(key, (err, data) => {
        if (!err && data !== null) {
          resolve(data);
        } else {
          const storeData =
            typeof value === "string" ? value : JSON.stringify(value);
          return req.redis_cache_db.setex(key, 3600, storeData);
        }
      });
    });
  };
  redisHelper.redLock = async (req, key, value) => {
    var redlock = new Redlock([client], {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: 0.01, // time in ms

      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount: 1,

      // the time in ms between attempts
      retryDelay: 200, // time in ms

      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://www.awsarchitectureblog.com/2015/03/backoff.html
      retryJitter: 200 // time in ms
    });

    var resource = "locks:" + key + ":" + value;
    var ttl = 1000 * 60 * 2;
    return redlock.lock(resource, ttl);
  };
})(module.exports);
