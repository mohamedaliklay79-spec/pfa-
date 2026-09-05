const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  favorites: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe"
  }
],
recipes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe"
  }
]
});

const User = mongoose.model("User", userSchema);
module.exports = User;