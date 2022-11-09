const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//midleware
app.use(cors());
app.use(express.json());

//MongoDb Add
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.teba24n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// jwt token fucntion

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    console.log("database connected");
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
}
run();

const ProductsCollection = client.db("korai").collection("products");
const ReviewCollecton = client.db("korai").collection("reviews");

//jwt  request
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    console.log(token);
    res.send({ token });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//created data in product page
app.get("/product", async (req, res) => {
  try {
    const cursor = ProductsCollection.find({});
    const products = await cursor.toArray();
    // console.log(products);
    res.send({
      success: true,
      message: `successfuly got the data`,
      data: products,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//created data in product Details page
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const product = await ProductsCollection.findOne(query);
    // console.log(product);
    res.send({
      success: true,
      message: `successfuly got the data`,
      data: product,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//data create on form
app.post("/product", async (req, res) => {
  try {
    const result = await ProductsCollection.insertOne(req.body);
    // console.log(result);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `successfuly created the ${req.body.name} with id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "could not create the product",
      });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//Review
// post in review
app.post("/review", async (req, res) => {
  try {
    const result = await ReviewCollecton.insertOne(req.body);
    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//get review item [created]
app.get("/review", async (req, res) => {
  try {
    const cursor = ReviewCollecton.find({});
    const reviews = await cursor.toArray();
    // console.log(products);
    res.send({
      success: true,
      message: `successfuly got the data`,
      data: reviews,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// dalete in review item
app.delete("/review/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ReviewCollecton.deleteOne({ _id: id });
    console.log(result);
    if (result.deletedCount) {
      res.send({
        success: true,
        message: "delete Succesfully",
      });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// go to  updated id
app.get("/review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const review = await ReviewCollecton.findOne({ _id: id });
    // console.log(review);
    res.send({
      success: true,
      message: "Updated Succesfully",
      data: review,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// updated Now
app.patch("/review/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ReviewCollecton.updateOne(
      { _id: id },
      { $set: req.body }
    );
    console.log(result);
    if (result.matchedCount) {
      res.send({
        success: true,
        message: "Update Succesfully",
      });
    } else {
      res.send({
        success: false,
        error: "could not Update the product",
      });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/", (req, res) => {
  res.send("korai resturent assignment is running");
});

app.listen(port, () => console.log(`server up and Runing on ${port}`));
