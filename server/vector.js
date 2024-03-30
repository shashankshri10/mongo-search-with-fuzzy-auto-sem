const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const {OpenAI} = require('openai');

require("dotenv").config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
const openai = new OpenAI({
  apiKey: process.env.VECTOR_KEY,
  // organization: "org-AN3jaKGEyQ9OOZdWxX5A7JdU"
});

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    methods: "GET, POST, PUT, DELETE"
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function run() {
  try {
    await client.connect();

    const database = client.db("sample_mflix");
    const coll = database.collection("embedded_movies");

    console.log("round");
    const embedding_res = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: "historical heist",
      encoding_format: "float",
    });
    const embedding = embedding_res.data.embedding;
    console.log(embedding);

    const agg = [
      {
        '$vectorSearch': {
          'index': 'vector_index', 
          'path': 'plot_embedding', 
          // 'filter': {
          //   '$and': [
          //     {
          //       'genres': {
          //         '$nin': [
          //           'Drama', 'Western', 'Crime'
          //         ], 
          //         '$in': [
          //           'Action', 'Adventure', 'Family'
          //         ]
          //       }
          //     }, {
          //       'year': {
          //         '$gte': 1960, 
          //         '$lte': 2000
          //       }
          //     }
          //   ]
          // }, 
          'queryVector': embedding, 
          'numCandidates': 200, 
          'limit': 10
        }
      }, {
        '$project': {
          '_id': 0, 
          'title': 1, 
          'genres': 1, 
          'plot': 1, 
          'year': 1, 
          'score': {
            '$meta': 'vectorSearchScore'
          }
        }
      }
    ];

    const result = coll.aggregate(agg);

    await result.forEach((doc) => console.dir(JSON.stringify(doc)));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
