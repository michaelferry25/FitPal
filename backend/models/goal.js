const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  dailyCalories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  waterLitres: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
