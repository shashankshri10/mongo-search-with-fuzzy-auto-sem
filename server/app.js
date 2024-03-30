const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const searchRoutes = require("./routes/searchRoutes")
// const { MongoClient, ServerApiVersion } = require('mongodb');

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

app.use("/api",searchRoutes);

app.listen(port, (data, err) => {
  if (err) {
    console.log("Error in running server", err);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});