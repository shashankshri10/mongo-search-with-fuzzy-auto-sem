const { MongoClient, ServerApiVersion } = require("mongodb");
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

module.exports = client;