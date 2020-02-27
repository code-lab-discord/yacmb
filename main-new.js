const { Client } = require('discord.js');
const CommandManager = require('./CommandMananger');
const commands = require('./commands');

require('dotenv').config();

const client = new Client();
const cmdManager = CommandManager({ commands });

client.on('ready',() => {
  console.log("ready");
});

client.on('message', message => {
  if (message.author === client.user)
    return;

  if (message.content.startsWith('.'))
    cmdManager.run(message.content.substr(1), message);
});

client.login(process.env.BOT_TOKEN);