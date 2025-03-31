require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const User = require('./models/user.js');
const Goal = require('./models/goal');

app.use(express.json());
app.use(cors());

const PORT = 5000;
const uri = 'mongodb://localhost:27017/fitpal';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.post('/api/signup', async (req, res) => {
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

    if (!firstname || !surname || !dateOfBirth || !address || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: "You must accept the Terms & Conditions" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

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

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { firstname, surname, email }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    return res.json({
      success: true,
      message: "Logged in successfully",
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

app.get('/api/recipes', async (req, res) => {
  const { category } = req.query;
  try {
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
        id: m.idMeal,
        title: m.strMeal,
        image: m.strMealThumb,
        category
      }));
    } else {
      meals = meals.map(m => ({
        id: m.idMeal,
        title: m.strMeal,
        image: m.strMealThumb,
        category: m.strCategory
      }));
    }
    res.json({ success: true, meals });
  } catch (err) {
    console.error("Recipes fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const meal = data.meals ? data.meals[0] : null;
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    const recipe = {
      id: meal.idMeal,
      title: meal.strMeal,
      instructions: meal.strInstructions,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      tags: meal.strTags ? meal.strTags.split(',') : [],
      youtube: meal.strYoutube
    };
    res.json({ success: true, recipe });
  } catch (err) {
    console.error("Recipe detail error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { dailyCalories, proteins, carbs, fats, waterLitres } = req.body;

    if (!dailyCalories || !proteins || !carbs || !fats || !waterLitres) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

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

app.get('/api/goals', async (req, res) => {
  try {
    const goal = await Goal.findOne({});
    res.json({ success: true, goal });
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
