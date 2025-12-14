// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const app = express();
// const port = 3000;

// // middleware
// app.use(express.json());
// app.use(cors());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kailwc7.mongodb.net/?appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();

//     const db = client.db("local_chef_bazaar_db");

//     const DailyFoodsCollection = db.collection("dailymeals");
//     const HomeReviewCollection = db.collection("home-review");
//     const MealsPageCollection = db.collection("meals");
//     const reviewCollection = db.collection("review");
//     // Post for Daily meals Section
//     app.post("/dailymeals", async (req, res) => {
//       const newDailyMeals = req.body;
//       const result = await DailyFoodsCollection.insertOne(newDailyMeals);
//       res.send(result);
//     });

//     // Get for Daily meals Section
//     app.get("/dailymeals", async (req, res) => {
//       const cursor = DailyFoodsCollection.find().sort({ price: -1 });
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // post for home review section
//     app.post("/home-review", async (req, res) => {
//       const newReview = req.body;
//       const result = await HomeReviewCollection.insertOne(newReview);
//       res.send(result);
//     });
//     // get for home review section
//     app.get("/home-review", async (req, res) => {
//       const cursor = HomeReviewCollection.find().sort({ rating: -1 });
//       const result = await cursor.toArray();
//       res.send(result);
//     });
//     // post for mealsPage section
//     app.post("/meals", async (req, res) => {
//       const newMeals = req.body;
//       const result = await MealsPageCollection.insertOne(newMeals);
//       res.send(result);
//     });
//     // get for mealsPage section
//     app.get("/meals", async (req, res) => {
//       const cursor = MealsPageCollection.find().sort({
//         price: -1,
//       });
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // get by id in meals detailspage section
//     app.get("/meals/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await MealsPageCollection.findOne(query);
//       res.send(result);
//     });
//     // add review
//     app.post("/review", async (req, res) => {
//       const review = req.body;
//       const result = await reviewCollection.insertOne(review);
//       res.send(result);
//     });
//     // get review for a specific food item
//     app.get("/review/:foodId", async (req, res) => {
//       const foodId = req.params.foodId;

//       const reviews = await reviewCollection
//         .find({ foodId: foodId })
//         .sort({ date: -1 })
//         .toArray();

//       res.send(reviews);
//     });
//     // delete a review
//     app.delete("/review/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await reviewCollection.deleteOne(query);
//       res.send(result);
//     });

//     // update a review
//     app.patch("/review/:id", async (req, res) => {
//       const id = req.params;
//       const updateData = req.body;
//       const query = { _id: new ObjectId(id) };
//       const update = { $set: updateData };
//       const result = await reviewCollection.updateOne(query, update);
//       res.send(result);
//     });

//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("Local chef bazar!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

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

    // Reviews

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
