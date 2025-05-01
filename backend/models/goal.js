const mongoose = require('mongoose');

// Goal model
// This schema defines the structure of the Goal document in the MongoDB database
const goalSchema = new mongoose.Schema({
  dailyCalories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  waterLitres: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
