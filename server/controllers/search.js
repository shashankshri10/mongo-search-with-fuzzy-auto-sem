// const client = require("../utils/db").client;
const fetchData = require("../utils/em");

const { MongoClient, ServerApiVersion } = require("mongodb");
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

exports.searchFuzzy = async (req, res) => {
  try {
    const searchVal = req.query.search.replace(/%/g, " ");
    console.log("Search value: ", searchVal);
    if (!searchVal) {
      console.log("Search value not provided");
      res.json({ message: "Search value not provided" });
      return;
    }
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("sample_mflix");
    if (!db) {
      console.log("Database not found");
      res.json({ message: "Database not found" });
    }
    const collection = db.collection("movies");
    if (!collection) {
      console.log("Collection not found");
      res.json({ message: "Collection not found" });
    }
    console.log("Collection found, setting up pipeline");
    const search_pipeline = [
      {
        $search: {
          text: {
            query: searchVal,
            path: [
              "plot",
              "genres",
              "cast",
              "title",
              "fullplot",
              "languages",
              "directors",
              "writers",
            ],
            fuzzy: {},
          },
        },
      },
      {
        $limit: 10,
      },
    ];
    const result = await collection.aggregate(search_pipeline).toArray();
    console.log("aggregate created");
    if (!result) {
      console.log("No result found");
      res.json({ message: "No result found" });
    }
    console.log("Result found");
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ message: err, status: "error in connection" });
  } finally {
    await client.close();
  }
};

exports.searchAutocomplete = async (req, res) => {
  try {
    const searchVal = req.query.search.replace(/%/g, " ");
    console.log("Search value: ", searchVal);
    if (!searchVal) {
      console.log("Search value not provided");
      res.json({ message: "Search value not provided" });
    }
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("sample_mflix");
    if (!db) {
      console.log("Database not found");
      res.json({ message: "Database not found" });
    }
    const collection = db.collection("movies");
    if (!collection) {
      console.log("Collection not found");
      res.json({ message: "Collection not found" });
    }
    console.log("Collection found, setting up pipeline");
    const search_pipeline = [
      {
        $search: {
          index: "autoCompleteMovies",
          autocomplete: {
            query: searchVal,
            path: "title",
            tokenOrder: "sequential",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 5,
              maxExpansions: 100,
            },
          },
        },
      },
      {
        $limit: 10,
      },
    ];
    const result = await collection.aggregate(search_pipeline).toArray();
    console.log("aggregate created");
    if (!result) {
      console.log("No result found");
      res.json({ message: "No result found" });
    }
    console.log("Result found");
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ message: err, status: "error in connection" });
  }
};

exports.searchSemantic = async (req, res) => {
  try {
    await client.connect();
    const searchVal = req.query.search.replace(/%/g, " ");
    const database = client.db("sample_mflix");
    const coll = database.collection("embedded_movies");
    const embedding_res = await fetchData(searchVal);
    const embedding = embedding_res;
    console.log(embedding);

    const agg = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "plot_embedding",
          'filter': {
            '$and': [
              {
                'genres': {
                  '$nin': [
                    'Drama', 'Western', 'Crime'
                  ],
                  '$in': [
                    'Action', 'Adventure', 'Family'
                  ]
                }
              }, {
                'year': {
                  '$gte': 1960,
                  '$lte': 2000
                }
              }
            ]
          },
          queryVector: embedding,
          numCandidates: 200,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          genres: 1,
          plot: 1,
          year: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ];

    const result = await coll.aggregate(agg).toArray();
    console.log("aggregate created");
    if (!result) {
      console.log("No result found");
      res.json({ message: "No result found" });
    }
    console.log("Result found");
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ message: err, status: "error in connection" });
  } finally {
    await client.close();
  }
};
