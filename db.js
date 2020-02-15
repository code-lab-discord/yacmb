const mongoose = require('mongoose');

require('dotenv').config();

/**
 * DB Connection
 */
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('DB Ready!');
});

// Models
require('./models/WarnSchema');
require('./models/MuteSchema');
require('./models/HackbanSchema');
require('./models/LeaderboardSchema');