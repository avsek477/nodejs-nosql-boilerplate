const Promise = require("bluebird");
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_DBNAME,
  DATABASE_DBUSER,
  DATABASE_DBPASS
} = require('../configs');

const dbConnector = async (app) => {
  try {
    return new Promise((resolve, reject) => {
      const user = encodeURIComponent(DATABASE_DBUSER);
      const password = encodeURIComponent(DATABASE_DBPASS);

      // Connection URL
      let dbUrl="";
      if (user !== "undefined" && password !== "undefined") {
        dbUrl = `mongodb://${user}:${password}@${DATABASE_HOST}:${DATABASE_PORT}/?authSource=${DATABASE_DBNAME}`
      } else {
        dbUrl = `mongodb://${DATABASE_HOST}:${DATABASE_PORT}`;
      }
      const options = {
          promiseLibrary: Promise,
          connectTimeoutMS: 60000,
          useNewUrlParser: true,
          useUnifiedTopology: true
      };

      const client = new MongoClient(dbUrl, options);

      client.connect(async(err, client) => {
        if(err) reject(err);
        const db = client.db(DATABASE_DBNAME);
        app.locals.db = db;
        console.log('database connection success');
        resolve(db);
      });
    })
  } catch(err) {
    throw new Error(err);
  }
}

module.exports = { 
  dbConnector
}
