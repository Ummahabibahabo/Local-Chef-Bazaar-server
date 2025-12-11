const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 3000;

// middleware

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Local chef bazar!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
