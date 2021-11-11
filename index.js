const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.luhyz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("baby_mart");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    // console.log("database connected successfully");

    // GET products API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("load user with id: ", id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    // GET orders API with matched email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // GET all orders API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // POST order API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("hitting the post", order);
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // UPDATE order API
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      console.log(updatedOrder, id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // DELETE order API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("deleting order with id", id);
      res.json(result);
    });
  } catch {
    //   await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
