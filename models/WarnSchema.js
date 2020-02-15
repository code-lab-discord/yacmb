const mongoose = require('mongoose');

const WarnProvider = new mongoose.Schema({
  userID: String,
  modUserID: String,
  reason: String
});

mongoose.model('Warn', WarnProvider);