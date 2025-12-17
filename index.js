const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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

    console.log("MongoDB connected successfully!");

    /* ===================== Daily Meals ===================== */
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

    /* ===================== Home Reviews ===================== */
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

    /* ===================== Meals Page ===================== */
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

    /* ===================== Reviews ===================== */
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review/:foodId", async (req, res) => {
      const foodId = req.params.foodId;
      const reviews = await reviewCollection
        .find({ foodId })
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });

    app.get("/my-reviews/:email", async (req, res) => {
      const email = req.params.email;
      const reviews = await reviewCollection
        .find({ userEmail: email })
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });

    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await reviewCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    /* ===================== Favorites ===================== */
    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const exist = await favoritesCollection.findOne({
        userEmail: favorite.userEmail,
        mealId: favorite.mealId,
      });

      if (exist) return res.send({ alreadyAdded: true });

      const result = await favoritesCollection.insertOne(favorite);
      res.send(result);
    });

    app.get("/favorites", async (req, res) => {
      const userEmail = req.query.userEmail;
      const favorites = await favoritesCollection
        .find({ userEmail })
        .sort({ addedTime: -1 })
        .toArray();
      res.send(favorites);
    });

    app.delete("/favorites/:id", async (req, res) => {
      const id = req.params.id;
      const result = await favoritesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    /* ===================== Orders ===================== */
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection
        .find()
        .sort({ orderTime: -1 })
        .toArray();
      res.send(orders);
    });

    app.get("/orders/:userEmail", async (req, res) => {
      const orders = await ordersCollection
        .find({ userEmail: req.params.userEmail })
        .sort({ orderTime: -1 })
        .toArray();
      res.send(orders);
    });

    app.get("/orders/food/:foodId", async (req, res) => {
      const foodId = req.params.foodId;
      const orders = await ordersCollection
        .find({ foodId })
        .sort({ orderTime: -1 })
        .toArray();
      res.send(orders);
    });

    /* ===================== Stripe Payment ===================== */
    app.post("/create-checkout-session", async (req, res) => {
      try {
        const paymentInfo = req.body;
        const amount = parseInt(paymentInfo.cost) * 100;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: amount,
                product_data: { name: paymentInfo.mealName },
              },
              quantity: 1,
            },
          ],
          customer_email: paymentInfo.userEmail,
          mode: "payment",
          metadata: {
            foodId: paymentInfo.foodId,
            orderId: paymentInfo.orderId.toString(),
          },
          success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
        });

        res.send({ url: session.url });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to create checkout session" });
      }
    });

    app.patch("/payment-success", async (req, res) => {
      try {
        const sessionId = req.query.session_id;
        if (!sessionId)
          return res.status(400).send({ error: "Session ID missing" });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
          const orderId = session.metadata.orderId;
          const result = await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: {
                paymentStatus: "paid",
                orderStatus: "accepted",
                transactionId: session.payment_intent,
              },
            }
          );
          return res.send({ success: true, result });
        }

        res.send({ success: false, message: "Payment not completed" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Payment update failed" });
      }
    });
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
