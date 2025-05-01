const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User model
// This schema defines the structure of the User document in the MongoDB database
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true }, // First name of the user
  surname: { type: String, required: true }, // Surname of the user
  dateOfBirth: { type: Date, required: true }, // Date of birth of the user
  address: { type: String, required: true }, // Address of the user
  email: { type: String, required: true, unique: true }, // Email of the user, must be unique
  password: { type: String, required: true }, // Password of the user, must be hashed
  acceptedTerms: { type: Boolean, default: false }, // Indicates if the user accepted the terms and conditions
  gender: {type: String},
  age: {type: Number}, // Age of the user
  height: { type: Number}, // Height of the user in cm
  activityLevel: { type: String}, // Activity level of the user
  calorieGoal: { type: Number}, // Daily calorie goal of the user
  darkMode: { type:Boolean, default:false } // Indicates if the user prefers dark mode
});

userSchema.pre('save', async function(next) {
  // Hash the password before saving the user document
  if (!this.isModified('password')) return next();
  // If the password is not modified, skip hashing
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare the password entered by the user with the hashed password in the database
// This method is used for user authentication during login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
