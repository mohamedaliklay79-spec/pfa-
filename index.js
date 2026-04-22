const express = require('express');
const app = express();

const mongoose = require("mongoose");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

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

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

//--------------------
app.use(express.json({ limit: '2mb' }));

//--------------------
// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again later.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please slow down.' },
});

app.use(generalLimiter);

const port = 3000;

//--------------------
// Helper: validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

//--------------------
// Signup
app.post('/api/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: "Invalid input" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Invalid email format" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ email: email.toLowerCase().trim(), password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Login
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: "Invalid input" });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!existingUser) return res.status(400).json({ message: "The information is incorrect" });

    // Compare with hashed password
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) return res.status(400).json({ message: "The information is incorrect" });

    return res.status(200).json({ message: "Login successful", userId: existingUser._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Add Recipe — prevents duplicates: same name + category + userId within 10 seconds
app.post('/api/AddRecipe/:userId', upload.single('image'), async (req, res) => {
  // Clean up uploaded file on any error
  const cleanupFile = () => {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  };

  try {
    const { name, selectedCategory, ingredients, steps } = req.body;
    const { userId } = req.params;

    // Validate userId
    if (!isValidId(userId)) { cleanupFile(); return res.status(400).json({ message: "Invalid user ID" }); }

    // Validate required fields
    if (!name || !selectedCategory) {
      cleanupFile();
      return res.status(400).json({ message: "Name and category are required" });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      cleanupFile();
      return res.status(400).json({ message: "Invalid recipe name" });
    }

    if (!req.file) { return res.status(400).json({ message: "No image uploaded" }); }

    const user = await User.findById(userId);
    if (!user) { cleanupFile(); return res.status(404).json({ message: "User not found" }); }

    const ing = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const stps = typeof steps === "string" ? JSON.parse(steps) : steps;

    if (!Array.isArray(ing) || !Array.isArray(stps)) {
      cleanupFile();
      return res.status(400).json({ message: "Ingredients and steps must be arrays" });
    }

    // Duplicate prevention: check if this user already has a recipe with same name+category
    // created in the last 30 seconds (prevents double-tap submissions)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const existingRecipes = await Recipe.find({
      name: name.trim(),
      category: selectedCategory,
      createdAt: { $gte: thirtySecondsAgo },
    });

    if (existingRecipes.length > 0) {
      // Check if any of those belong to this user
      const userOwnsDuplicate = existingRecipes.some(r =>
        user.recipes.some(userRecipeId => userRecipeId.toString() === r._id.toString())
      );
      if (userOwnsDuplicate) {
        cleanupFile();
        return res.status(409).json({ message: "Recipe already being created, please wait." });
      }
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "recipes" });
    const imageUrl = result.secure_url;

    const newRecipe = new Recipe({
      name: name.trim(),
      category: selectedCategory,
      ingredients: ing.filter(i => typeof i === 'string' && i.trim()),
      steps: stps.filter(s => typeof s === 'string' && s.trim()),
      imageUrl,
      createdAt: new Date(),
    });
    await newRecipe.save();

    user.recipes.push(newRecipe._id);
    await user.save();

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Recipe created successfully', recipeId: newRecipe._id, imageUrl });
  } catch (error) {
    cleanupFile();
    console.error("AddRecipe error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//--------------------
// Get all recipes (optional category filter)
app.get('/api/recipes', async (req, res) => {
  try {
    const { category } = req.query;
    // Sanitize category input
    const filter = category && typeof category === 'string' ? { category: category.trim() } : {};
    const recipes = await Recipe.find(filter).select('-__v');
    res.json(recipes);
  } catch (err) {
    console.error("Get recipes error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

//--------------------
// Update (edit) a recipe — only owner can edit
app.put('/api/recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { name, ingredients, steps, userId } = req.body;

    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipe ID" });
    if (!userId || !isValidId(userId)) return res.status(400).json({ message: "Valid user ID is required" });

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0)
      return res.status(400).json({ message: "Valid recipe name is required" });
    if (!Array.isArray(ingredients) || !Array.isArray(steps))
      return res.status(400).json({ message: "Ingredients and steps must be arrays" });

    // Verify ownership
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const owns = user.recipes.some(id => id.toString() === recipeId);
    if (!owns) return res.status(403).json({ message: "You don't have permission to edit this recipe" });

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        name: name.trim(),
        ingredients: ingredients.filter(i => typeof i === 'string' && i.trim()),
        steps: steps.filter(s => typeof s === 'string' && s.trim()),
      },
      { new: true }
    );

    if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    console.error("Update recipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Delete a recipe — only owner can delete
app.delete('/api/recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;

    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipe ID" });
    if (!userId || !isValidId(userId)) return res.status(400).json({ message: "Valid user ID is required" });

    // Verify ownership before deletion
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const owns = user.recipes.some(id => id.toString() === recipeId);
    if (!owns) return res.status(403).json({ message: "You don't have permission to delete this recipe" });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Remove recipe from user's recipes and favorites arrays
    await User.findByIdAndUpdate(userId, { $pull: { recipes: recipeId, favorites: recipeId } });

    // Also remove from other users' favorites
    await User.updateMany({}, { $pull: { favorites: recipeId } });

    // Delete image from Cloudinary if present
    if (recipe.imageUrl) {
      try {
        const publicId = recipe.imageUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Cloudinary delete error (non-fatal):", err.message);
      }
    }

    await Recipe.findByIdAndDelete(recipeId);

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Delete recipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Favorites — get
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const recipes = await Recipe.find({ _id: { $in: user.favorites } }).select('-__v');
    res.json(recipes);
  } catch (err) {
    console.error("Favorites error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// My Recipes
app.get('/api/myrecipes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const recipes = await Recipe.find({ _id: { $in: user.recipes } }).select('-__v');
    res.json(recipes);
  } catch (err) {
    console.error("MyRecipes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Add to Favorites — prevents duplicates
app.post('/api/favorites/add', async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) return res.status(400).json({ message: "Missing data" });
    if (!isValidId(userId)) return res.status(400).json({ message: "Invalid userId" });
    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipeId" });

    // Confirm recipe exists
    const recipeExists = await Recipe.exists({ _id: recipeId });
    if (!recipeExists) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favorites.some(fav => fav.toString() === recipeId))
      return res.status(400).json({ message: "Already in favorites" });

    user.favorites.push(recipeId);
    await user.save();

    res.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Remove from Favorites
app.post('/api/favorites/remove', async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) return res.status(400).json({ message: "Missing data" });
    if (!isValidId(userId)) return res.status(400).json({ message: "Invalid userId" });
    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipeId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites.filter(fav => fav.toString() !== recipeId);
    await user.save();

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//--------------------
// Global error handler for multer and other middleware errors
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});