const CommandManager = ({ commands } = {}) => ({
  commands,
  run: async function(commandName, context) {
    commands[commandName].run(context);
  }
});

module.exports = CommandManager;