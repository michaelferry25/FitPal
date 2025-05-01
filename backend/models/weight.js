const mongoose = require('mongoose');

// Weight model
// Schema defines the structure of the Weight document in the MongoDB database
const weightSchema = new mongoose.Schema({
  // Fields for the weight document
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: Date, required: true } 
});

module.exports = mongoose.model('Weight', weightSchema);