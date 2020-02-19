/**
 * Reformat commands object for help embed
 * 
 * TODO: Re-add role check
 * 
 * @param {Object} commands commands object
 */
const formatCommands = commands => {
    let cmds = Object.entries(commands)
                .flat()
                .filter((cmd) => cmd.hidden === false);

    return cmds.map((cmd) => ({
        name: `.${cmd.label}`,
        value: cmd.description
    }));
}

/**
 * Get aliases of command
 * 
 * @param {Object} command command object
 */
const getAliases = command => {
    if (command.aliases.length < 1)
        return ""; 
    
    let aliases = "";
    for (let alias of command.aliases) {
        aliases += `.${alias}`;
    }

    return aliases;
}

/**
 * Get command usage
 * 
 * @param {Object} command command object
 */
const getUsage = command => {
    if (!command.usage)
        return "";
    return `\n **Usage**: ${command.usage}`;
}

module.exports = {
    formatCommands,
    getAliases,
    getUsage
};