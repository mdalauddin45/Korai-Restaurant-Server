const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("assignment is running");
});

app.listen(port, () => console.log(`server up and Runing on ${port}`));
