const mongoose = require('mongoose');

const LeaderboardProvider = new mongoose.Schema({
  userID: String,
  points: Number
});

mongoose.model('Leaderboard', LeaderboardProvider);