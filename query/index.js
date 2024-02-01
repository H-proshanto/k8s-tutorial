const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const mongoose = require("mongoose");
const PostModel = require("./database");

mongoose.connect("mongodb://mongodb-clusterip-svc:27017/blog-post", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/posts", async (req, res) => {
  const posts = await PostModel.find().lean();
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  // handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");
  try {
    const res = await axios.get("http://event-bus-svc:4005/events");
    for (let event of res.data) {
      console.log("Processing event:", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
