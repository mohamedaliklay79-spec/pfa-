const mongoose = require("mongoose");
const schema = mongoose.Schema;

const RecipeSchema = new schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  ingredients: [String],
  steps: [String],
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;
