const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const PostModel = require("./database");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://mongodb-clusterip-svc:27017/blog-post", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/posts/:id/comments", async (req, res) => {
  const post = await PostModel.findOne({ id: req.params.id }).lean();

  res.send(post?.comments || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const post = await PostModel.findOne({ id: req.params.id }).lean();
  const comments = post?.comments || [];

  comments.push({ id: commentId, content, status: "pending" });

  await PostModel.updateOne({ id: req.params.id }, { comments: comments });

  await axios.post("http://event-bus-svc:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const post = await PostModel.findOne({ id: postId }).lean();
    const comments = post?.comments || [];

    const updatedComments = comments.map((comment) => {
      if (comment.id === id) {
        comment.status = status;
      }
      return comment;
    });

    await PostModel.updateOne(
      { id: postId },
      { comments: updatedComments },
      {
        new: true,
      }
    );

    await axios.post("http://event-bus-svc:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
