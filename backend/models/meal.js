const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  email: String,
  food: String,
  category: String,
  quantity: Number,
  unit: String,
  calories: Number,
  carbs: Number,
  protein: Number,
  fats: Number,
  date: String
});

module.exports = mongoose.model('Meal', mealSchema);
