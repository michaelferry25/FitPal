require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const User = require('./models/user.js');

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('API is running');
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
