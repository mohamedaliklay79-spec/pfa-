const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Recipeshcema = new schema({
    name: String,
    category: String,
    ingredients: [String],
    steps: [String],
    imageUrl: { // <-- fix the case
        type: String,
        required: false,
    }
});

const Recipe = mongoose.model("Recipe", Recipeshcema);

module.exports = Recipe;