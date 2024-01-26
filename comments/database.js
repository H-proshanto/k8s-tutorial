const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  comments: { type: [Object], required: false },
});

const PostModel = mongoose.model("Posts", PostSchema);

module.exports = PostModel;
