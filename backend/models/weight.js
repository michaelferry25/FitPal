const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: Date, required: true } 
});

module.exports = mongoose.model('Weight', weightSchema);