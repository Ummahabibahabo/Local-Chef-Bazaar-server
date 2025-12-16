const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kailwc7.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("local_chef_bazaar_db");

    const DailyFoodsCollection = db.collection("dailymeals");
    const HomeReviewCollection = db.collection("home-review");
    const MealsPageCollection = db.collection("meals");
    const reviewCollection = db.collection("review");
    const favoritesCollection = db.collection("favorites");
    const ordersCollection = db.collection("orders");
    // Daily Meals

    app.post("/dailymeals", async (req, res) => {
      const newDailyMeals = req.body;
      const result = await DailyFoodsCollection.insertOne(newDailyMeals);
      res.send(result);
    });

    app.get("/dailymeals", async (req, res) => {
      const cursor = DailyFoodsCollection.find().sort({ price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // Home Reviews

    app.post("/home-review", async (req, res) => {
      const newReview = req.body;
      const result = await HomeReviewCollection.insertOne(newReview);
      res.send(result);
    });

    app.get("/home-review", async (req, res) => {
      const cursor = HomeReviewCollection.find().sort({ rating: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // Meals Page

    app.post("/meals", async (req, res) => {
      const newMeals = req.body;
      const result = await MealsPageCollection.insertOne(newMeals);
      res.send(result);
    });

    app.get("/meals", async (req, res) => {
      const cursor = MealsPageCollection.find().sort({ price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/meals/:id", async (req, res) => {
      const id = req.params.id;
      const result = await MealsPageCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Add review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // Get all reviews for a specific food
    app.get("/review/:foodId", async (req, res) => {
      const foodId = req.params.foodId;
      const reviews = await reviewCollection
        .find({ foodId })
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });
    // Get reviews by user email
    app.get("/my-reviews/:email", async (req, res) => {
      const email = req.params.email;
      const reviews = await reviewCollection
        .find({ userEmail: email })
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });

    // Delete review
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Update review
    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await reviewCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });
    // add favorite
    app.post("/favorites", async (req, res) => {
      const favorite = req.body;

      const exist = await favoritesCollection.findOne({
        userEmail: favorite.userEmail,
        mealId: favorite.mealId,
      });

      if (exist) {
        return res.send({ alreadyAdded: true });
      }

      const result = await favoritesCollection.insertOne(favorite);
      res.send(result);
    });
    // Create a new order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    // (Optional) Get all orders for a user
    app.get("/orders/:userEmail", async (req, res) => {
      const orders = await ordersCollection
        .find({ userEmail: req.params.userEmail })
        .sort({ orderTime: -1 })
        .toArray();
      res.send(orders);
    });
    console.log("MongoDB connected successfully!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Local chef bazar API is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
