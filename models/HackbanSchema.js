const mongoose = require('mongoose');

const HackbanProvider = new mongoose.Schema({
  userID: String,
  modUserID: String,
  reason: String
});

mongoose.model('Hackban', HackbanProvider);