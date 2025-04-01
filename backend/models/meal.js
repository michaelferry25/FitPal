const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  food: { type: String, required: true },
  calories: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meal', mealSchema);
