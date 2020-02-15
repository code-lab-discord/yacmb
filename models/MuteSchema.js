const mongoose = require('mongoose');

const MuteProvider = new mongoose.Schema({
  userID: String,
  modUserID: String,
  reason: String
});

mongoose.model('Mute', MuteProvider);