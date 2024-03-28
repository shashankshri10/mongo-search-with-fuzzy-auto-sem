const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    methods: "GET, POST, PUT, DELETE"
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    }
});

app.get('/search-fuzzy', async (req, res) => {
    try{
        const searchVal = (req.query.search).replace(/%/g, " ");
        console.log('Search value: ', searchVal);
        if(!searchVal){
            console.log('Search value not provided');
            res.json({message: "Search value not provided"});
            return;
        }
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db("sample_mflix");
        if(!db){
            console.log('Database not found');
            res.json({message: "Database not found"});
        }
        const collection = db.collection("movies");
        if(!collection){
            console.log('Collection not found');
            res.json({message: "Collection not found"});
        }
        console.log('Collection found, setting up pipeline');
        const search_pipeline = [
            {
                $search: {
                    text: {
                        query: searchVal,
                        path: ["plot","genres","cast","title","fullplot","languages","directors","writers"],
                        fuzzy: {},
                    }
                }
            }
        ];
        const result = await collection.aggregate(search_pipeline).toArray();
        console.log("aggregate created");
        if(!result){
            console.log('No result found');
            res.json({message: "No result found"});
        }
        console.log('Result found');
        res.json(result);
    }
    catch(err){
        console.log(err);
        res.json({message: err, status: "error in connection"});
    }
    finally{
        await client.close();
    }
});

app.get('/search-autocomplete', async (req, res) => {
    try{
        const searchVal = (req.query.search).replace(/%/g, " ");
        console.log('Search value: ', searchVal);
        if(!searchVal){
            console.log('Search value not provided');
            res.json({message: "Search value not provided"});
        }
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db("sample_mflix");
        if(!db){
            console.log('Database not found');
            res.json({message: "Database not found"});
        }
        const collection = db.collection("movies");
        if(!collection){
            console.log('Collection not found');
            res.json({message: "Collection not found"});
        }
        console.log('Collection found, setting up pipeline');
        const search_pipeline = [
            {
                $search: {
                    index: 'autoCompleteMovies',
                    "autocomplete":{
                        query: searchVal,
                        path: "title",
                        tokenOrder: "sequential",
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 5,
                            maxExpansions: 100,
                        }
                    }
                }
            },{
                $limit: 10
            }
        ];
        const result = await collection.aggregate(search_pipeline).toArray();
        console.log("aggregate created");
        if(!result){
            console.log('No result found');
            res.json({message: "No result found"});
        }
        console.log('Result found');
        res.json(result);
    }
    catch(err){
        console.log(err);
        res.json({message: err, status: "error in connection"});
    }
});

app.get('/search-movie', async (req, res) => {
    try{
        const searchVal = (req.query.search).replace(/%/g, " ");
        console.log('Search value: ', searchVal);
        if(!searchVal){
            console.log('Search value not provided');
            res.json({message: "Search value not provided"});
            return;
        }
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db("sample_mflix");
        if(!db){
            console.log('Database not found');
            res.json({message: "Database not found"});
        }
        const collection = db.collection("movies");
        if(!collection){
            console.log('Collection not found');
            res.json({message: "Collection not found"});
        }
        console.log('Collection found, setting up pipeline');
        const search_pipeline = [
            {
                $search: {
                    text: {
                        query: searchVal,
                        path: ["title"]
                    }
                }
            },
            {
                $limit: 1
            }
        ];
        const result = await collection.aggregate(search_pipeline).toArray();
        console.log("aggregate created");
        if(!result){
            console.log('No result found');
            res.json({message: "No result found"});
        }
        console.log('Result found');
        res.json(result);
    }
    catch(err){
        console.log(err);
        res.json({message: err, status: "error in connection"});
    }
    finally{
        await client.close();
    }
})

async function getEmbedding(query) {
    // Define the OpenAI API url and key.
    const url = 'https://api.openai.com/v1/embeddings';
    const openai_key = 'your_openai_key'; // Replace with your OpenAI key.
    
    // Call OpenAI API to get the embeddings.
    let response = await axios.post(url, {
        input: query,
        model: "text-embedding-ada-002"
    }, {
        headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
        }
    });
    
    if(response.status === 200) {
        return response.data.data[0].embedding;
    } else {
        throw new Error(`Failed to get embedding. Status code: ${response.status}`);
    }
}

async function findSimilarDocuments(embedding) {
    const url = 'your_mongodb_url'; // Replace with your MongoDB url.
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        
        const db = client.db('<DB_NAME>'); // Replace with your database name.
        const collection = db.collection('<COLLECTION_NAME>'); // Replace with your collection name.
        
        // Query for similar documents.
        const documents = await collection.aggregate([
  {"$vectorSearch": {
    "queryVector": embedding,
    "path": "plot_embedding",
    "numCandidates": 100,
    "limit": 5,
    "index": "moviesPlotIndex",
      }}
]).toArray();
        
        return documents;
    } finally {
        await client.close();
    }
}

app.get("/all",async (req,res)=>{
    try{
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db("sample_mflix");
        if(!db){
            console.log('Database not found');
            res.json({message: "Database not found"});
        }
        const collection = db.collection("movies");
        if(!collection){
            console.log('Collection not found');
            res.json({message: "Collection not found"});
        }
        console.log('Collection found, setting up pipeline');
        const result = await collection.find({}).toArray();
        console.log("aggregate created");
        if(!result){
            console.log('No result found');
            res.json({message: "No result found"});
        }
        console.log('Result found');
        res.json(result);
    }
    catch(err){
        console.log(err);
        res.json({message: err, status: "error in connection"});
    }
    finally{
        await client.close();
    }
})

app.listen(port, (data,err) => {
    if(err) {
        console.log('Error in running server', err);
    }
    else{
        console.log(`Server is running on port ${port}`);
    }
})
