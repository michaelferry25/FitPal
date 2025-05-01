// Sever code for FitPal application
// This code handles user authentication, meal logging, goal setting, and fetching recipes from an external API.
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const User = require('./models/user.js');
const Goal = require('./models/goal');
const Meal = require('./models/meal');
const Weight = require('./models/weight');

app.use(express.json());
app.use(cors());

// MongoDB connection
const PORT = 5000;
const uri = "mongodb+srv://michaelferry2004:A4NJsrBBFfCXCfQX@fitpal.kuaipg7.mongodb.net/?retryWrites=true&w=majority&appName=FitPal";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected")) // MongoDB connection success message
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


app.post('/api/signup', async (req, res) => {
  // Handles user signup
  // Validates input fields and checks if the user already exists in the database
  // If the user does not exist, creates a new user and saves it to the database
  try {
    const {
      firstname,
      surname,
      dateOfBirth,
      address,
      email,
      password,
      acceptedTerms
    } = req.body;

    // Check if all required fields are provided
    // If any field is missing, return a 400 error with a message
    if (!firstname || !surname || !dateOfBirth || !address || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if the user has accepted the terms and conditions
    // If not, return a 400 error with a message
    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: "You must accept the Terms & Conditions" });
    }

    // Check if the user already exists in the database
    // If the user exists, return a 400 error with a message
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create a new user object with the provided data
    // The password is hashed before saving to the database for security reasons
    const user = new User({
      firstname,
      surname,
      dateOfBirth,
      address,
      email,
      password,
      acceptedTerms
    });
    await user.save();

    // Return a success response with the user's information
    return res.status(201).json({
      success: true,
      message: "Account created successfully", // Success message
      user: { firstname, surname, email }
    });
  } catch (err) {
    console.error("Signup error:", err); 
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Handles user login
// Validates input fields and checks if the user exists in the database
app.post('/api/login', async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    // Check if the user exists in the database
    // If the user does not exist, return a 400 error with a message
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    // Compare the provided password with the hashed password in the database
    // If the passwords do not match, return a 400 error with a message
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    // If the credentials are valid, return a success response with the user's information
    return res.json({
      success: true,
      message: "Logged in successfully", // Success message
      user: {
        firstname: user.firstname,
        surname: user.surname,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err); 
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch recipes from the external API
// This retrieves recipes based on the provided category or all recipes if no category is specified
app.get('/api/recipes', async (req, res) => {
  const { category } = req.query;
  try { 
    // Fetch recipes from the external API
    // If a category is provided for a meal, fetch recipes for that category
    let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    if (category) {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    let meals = data.meals || [];
    if (category) {
      meals = meals.map(m => ({
        id: m.idMeal, // ID of the meal
        title: m.strMeal, // Title of the meal
        image: m.strMealThumb,  // Image URL of the meal
        category // Category of the meal (e.g., Chicken, Beef)
      }));
    } else{
      // If no category is provided, map the meals to include only the necessary fields
      meals = meals.map(m => ({
        id: m.idMeal,
        title: m.strMeal,
        image: m.strMealThumb,
        category: m.strCategory
      }));
    }
    res.json({ success: true, meals }); // Return the fetched recipes
  } catch (err) {
    console.error("Recipes fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch recipe details by ID
// This retrieves detailed information about a specific recipe based on its ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // URL to fetch recipe details from the external API
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Parse the response data
    // If the recipe is not found, return a 404 error with a message
    const data = await response.json();
    const meal = data.meals ? data.meals[0] : null;
    if (!meal) {
      // If no meal is found, return a 404 error
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    const recipe = {
      // Map the meal data to a more user-friendly format
      // The recipe object includes the meal ID, title, instructions, image, category, area, tags, and YouTube link
      id: meal.idMeal, // ID of the recipe
      title: meal.strMeal, // Title of the recipe
      instructions: meal.strInstructions, // Instructions for preparing the recipe
      image: meal.strMealThumb, // Image URL of the recipe
      category: meal.strCategory, // Category of the recipe (e.g., Chicken, Beef)
      area: meal.strArea, // Area of the recipe (e.g., Italian, Mexican)
      tags: meal.strTags ? meal.strTags.split(',') : [], // Split tags into an array
      youtube: meal.strYoutube // YouTube link for the recipe
    };
    res.json({ success: true, recipe });
  } catch (err) {
    console.error("Recipe detail error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Set user goals
// This allows users to set their daily goals for calories, proteins, carbs, fats, and water intake
app.post('/api/goals', async (req, res) => {
  try {
    const { dailyCalories, proteins, carbs, fats, waterLitres } = req.body;

    if (!dailyCalories || !proteins || !carbs || !fats || !waterLitres) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if the user already has a goal set
    // If a goal exists, update it, otherwise just create a new goal
    let goal = await Goal.findOne({});
    if (goal) {
      Object.assign(goal, { dailyCalories, proteins, carbs, fats, waterLitres });
    } else {
      goal = new Goal({ dailyCalories, proteins, carbs, fats, waterLitres });
    }

    await goal.save();
    res.json({ success: true, goal });

  } catch (err) {
    console.error('Error setting goals:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user goals
// This retrieves the goals set by the user
app.get('/api/goals', async (req, res) => {
  try {
    const goal = await Goal.findOne({});
    res.json({ success: true, goal });
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// To log a users meals
// This allows users to log their meals with details such as food name, category, quantity, etc.
// The meal is saved to the database with the user's email and the current date
app.post('/api/meals', async (req, res) => {
  try {
    // The meal details include food name, category, quantity, unit, calories, carbs, protein, and fats
    const { email, food, category, quantity, unit, calories, carbs, protein, fats } = req.body;

    if (!email || !food || !calories) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const meal = new Meal({
      // Creates a new meal object with the provided data
      email,
      food,
      category,
      quantity,
      unit,
      calories,
      carbs,
      protein,
      fats,
      date: new Date().toISOString().split('T')[0]
    });

    await meal.save();
    return res.status(201).json({ success: true, message: "Meal saved successfully" });

  } catch (err) {
    console.error("Meal saving error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get today's meals for a user
app.post('/api/get-meals', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find meals for the user on the current date
    // The meals are filtered by the user's email and today's date
    const meals = await Meal.find({ email, date: today });

    res.json({ success: true, meals });
  } catch (err) {
    console.error("Meal fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Save user goals
// This allows users to save their goals
app.post('/api/save-goals', async (req, res) => {
  const { email, gender, age, height, activityLevel, calorieGoal } = req.body; // User goals

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user goals
    user.gender = gender;
    user.age = age;
    user.height = height;
    user.activityLevel = activityLevel;
    user.calorieGoal = calorieGoal;

    await user.save();
    res.json({ success: true, message: "User goals updated successfully" }); // asuccess response
  } catch (err) {
    console.error("Error saving goals:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user goals
// This retrieves the users goals based on their email address
app.post('/api/get-user-goals', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      // Return the users goals
      success: true,
      user: {
        gender: user.gender,
        age: user.age,
        height: user.height,
        activityLevel: user.activityLevel,
        calorieGoal: user.calorieGoal
      }
    });
  } catch (err) {
    console.error("Error retrieving user goals:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Log users daily weight
app.post('/api/log-weight', async (req, res) => {
  const { email, weight, date } = req.body;

  if (!email || !weight || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // Check if the user already has a weight log for the given date
    // If a log exists, update it; otherwise, create a new log
    let weightLog = await Weight.findOne({ email, date });
    if (weightLog) {
      weightLog.weight = weight;
    } else {
      weightLog = new Weight({ email, weight, date });
    }

    // Save the weight log to the database
    await weightLog.save();
    res.json({ success: true, message: 'Weight logged successfully.' });
  } catch (err) {
    console.error('Error logging weight:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a users logged weights sorted by date added
app.post('/api/get-weight-log', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required.' });
  }

  try {
    // Fetch the user's weight logs from the database
    // Sort the logs by date in ascending order
    const weights = await Weight.find({ email }).sort({ date: 1 });
    res.json({ success: true, weights });
  } catch (err) {
    console.error('Error retrieving weights:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save dark mode preference
app.post('/api/dark-mode', async (req, res) => {
  try {
    const { email, darkMode } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { darkMode },
      { new: true }
    );
    res.json({ success: true, darkMode: user.darkMode });
  } catch (err) {
    console.error('Dark mode save error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dark mode preference
app.get('/api/dark-mode/:email', async (req, res) => {
  try {
    // Fetch the user's dark mode preference based on their email
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, darkMode: user.darkMode });
  } catch (err) {
    console.error('Dark mode fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save dark mode setting
// This allows users to save their dark mode preference
app.post('/api/save-dark-mode', async (req, res) => {
  try {
    const { email, darkMode } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.darkMode = darkMode;
    await user.save();

    return res.json({ success: true, message: 'Dark mode updated successfully' });
  } catch (err) {
    console.error('Error saving dark mode setting:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save user settings
// This allows users to save their settings such as notifications, measurement system, etc.
app.post('/api/save-settings', async (req, res) => {
  const {
    // User settings
    email,
    darkMode,
    notifications,
    notificationFrequency,
    measurementSystem,
    weightGoal,
    shareProgress,
    reminderTime,
    calorieGoal
  } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user settings
    user.darkMode = darkMode;
    user.notifications = notifications;
    user.notificationFrequency = notificationFrequency;
    user.measurementSystem = measurementSystem;
    user.weightGoal = weightGoal;
    user.shareProgress = shareProgress;
    user.reminderTime = reminderTime;
    user.calorieGoal = calorieGoal;

    await user.save();

    // Return a success response
    return res.json({ success: true, message: "Settings saved successfully" });
  } catch (err) {
    console.error('Error saving user settings:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
