const express = require('express');
const app = express();

const mongoose = require("mongoose");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

//--------------------
// MongoDB connection
mongoose.connect("mongodb://klay79:qwvf6pazVGgbhYiV@ac-1mtgq44-shard-00-00.iwc4nrb.mongodb.net:27017,ac-1mtgq44-shard-00-01.iwc4nrb.mongodb.net:27017,ac-1mtgq44-shard-00-02.iwc4nrb.mongodb.net:27017/?ssl=true&replicaSet=atlas-k0f6ud-shard-0&authSource=admin&appName=pfaprojet")
  .then(() => { console.log("connect ok"); })
  .catch((error) => { console.log("connection failed", error); });

//--------------------
// Cloudinary config
cloudinary.config({
  cloud_name: 'dazamog56',
  api_key: '719347255689293',
  api_secret: 'a0TLYvgOrlZjhaVRDgHw-cSdVqQ',
});

const User = require("./modules/User.js");
const Recipe = require("./modules/recipe.js");

//--------------------
// Multer config (temporary disk storage)
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage });

//--------------------
app.use(express.json());

const port = 3000;

//--------------------
// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//--------------------
// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login request:", req.body);
    const existingUser = await User.findOne({ email, password });
    if (existingUser) {
      return res.status(200).json({ message: "Login successful", userId: existingUser._id });
    } else {
      return res.status(400).json({ message: "The information is incorrect" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//--------------------
// Add Recipe with image upload
app.post('/api/AddRecipe/:userId', upload.single('image'), async (req, res) => {
  try {
    const { name, selectedCategory, ingredients, steps } = req.body;
    const { userId } = req.params;

    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: "recipes" });
    const imageUrl = result.secure_url;

    const ing = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const stps = typeof steps === "string" ? JSON.parse(steps) : steps;

    const newRecipe = new Recipe({ name, category: selectedCategory, ingredients: ing, steps: stps, imageUrl });
    await newRecipe.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.recipes.push(newRecipe._id);
    await user.save();

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Recipe created successfully', recipeId: newRecipe._id, imageUrl });
  } catch (error) {
    console.error("AddRecipe error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//--------------------
// Get all recipes (optional category filter)
app.get('/api/recipes', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//--------------------
// Update (edit) a recipe
app.put('/api/recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { name, ingredients, steps, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipeId))
      return res.status(400).json({ message: "Invalid recipe ID" });

    // Optional: verify the recipe belongs to this user
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const owns = user.recipes.some(id => id.toString() === recipeId);
      if (!owns) return res.status(403).json({ message: "You don't own this recipe" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { name, ingredients, steps },
      { new: true }
    );

    if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    console.error("Update recipe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//--------------------
// Delete a recipe
app.delete('/api/recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipeId))
      return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Remove recipe from the user's recipes array
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, { $pull: { recipes: recipeId, favorites: recipeId } });
    }

    // Delete image from Cloudinary if present
    if (recipe.imageUrl) {
      try {
        const publicId = recipe.imageUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Cloudinary delete error (non-fatal):", err);
      }
    }

    await Recipe.findByIdAndDelete(recipeId);

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Delete recipe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//--------------------
// Favorites — get
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const recipes = await Recipe.find({ _id: { $in: user.favorites } });
    res.json(recipes);
  } catch (err) {
    console.error("Favorites error:", err);
    res.status(500).json({ message: err.message });
  }
});

//--------------------
// My Recipes
app.get('/api/myrecipes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const recipes = await Recipe.find({ _id: { $in: user.recipes } });
    res.json(recipes);
  } catch (err) {
    console.error("MyRecipes error:", err);
    res.status(500).json({ message: err.message });
  }
});

//--------------------
// Add to Favorites
app.post('/api/favorites/add', async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) return res.status(400).json({ message: "Missing data" });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });
    if (!mongoose.Types.ObjectId.isValid(recipeId)) return res.status(400).json({ message: "Invalid recipeId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favorites.some(fav => fav.toString() === recipeId))
      return res.status(400).json({ message: "Already in favorites" });

    user.favorites.push(recipeId);
    await user.save();

    res.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//--------------------
// Remove from Favorites
app.post('/api/favorites/remove', async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) return res.status(400).json({ message: "Missing data" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites.filter(fav => fav.toString() !== recipeId);
    await user.save();

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    // FIX: was using Alert (React Native) in server code — that's a bug, replaced with proper response
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
