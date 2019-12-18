const Eris = require("eris");
const ytdl = require('ytdl-core');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/yacmb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('DB Ready!');
});

var warnSchema = new mongoose.Schema({
    userID: String,
    modUserID: String,
    reason: String
});

var muteSchema = new mongoose.Schema({
    userID: String,
    modUserID: String,
    reason: String
});

var hackbanSchema = new mongoose.Schema({
    userID: String,
    modUserID: String,
    reason: String
});

var leaderboardSchema = new mongoose.Schema({
    userID: String,
    points: Number
});

var warn = mongoose.model('warn', warnSchema);

var hackban = mongoose.model('hackban', hackbanSchema);

var mute = mongoose.model('mute', muteSchema);

var leader = mongoose.model('leaderboard', leaderboardSchema);

var discordMention = new RegExp(/[<>@]/g);

var discordChannel = new RegExp(/[<>#]/g);

function format() {
    seconds = process.uptime();
    var days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    var hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    var mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    return days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + Math.round(seconds) + " Seconds";
}

// Connects Bot
var bot = new Eris.CommandClient("HAHAHA", {
    defaultImageFormat: "png",
    defaultImageSize: 2048,
}, {
    defaultHelpCommand: false,
    description: "Yet Another Custom Moderation Bot",
    owner: "lucy#8008",
    prefix: "."
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("guildMemberAdd", (g, m) => {
    hackban.findOne({
        userID: m.id
    }).then(ban => {
        if (ban) {
            bot.getDMChannel(ban.userID).then(dm => {
                bot.createMessage(dm.id, `You were banned from ${msg.channel.guild.name}. ${reason}`);
                bot.banGuildMember(g.id, m.id, 0, ban.reason);
                bot.createMessage('645980981144322058', `<@${m.id}> hackban actioned.`);
            });
        }
    });
});

/*bot.on('messageCreate', (msg) => {
    if(msg.content.toLowerCase().includes('advisor') || msg.content.toLowerCase().includes('code god')){
        msg.member.ban(0, 'they said the forbidden words');
    }
});*/ // for hunter

bot.registerCommand("ping", async (msg) => {
    const m = await bot.createMessage(msg.channel.id, "Ping?");
    var latency = new Date().getTime();
    m.edit(`:ping_pong: Pong! Latency is ${latency - m.timestamp}ms.`);
}, {
    //pinging test
    description: "Pong!",
    fullDescription: "This command could be used to check if the bot is responding and the bot's latency."
});

bot.registerCommand('help', async (msg, args) => {
    if (args.length === 0) {
        var helpEmbed = {
            embed: {
                title: "YACMB Help", // Title of the embed
                description: "YACMB: **Yet Another Custom Moderation Bot**",
                color: 0x008000, // Color, either in hex (show), or a base-10 integer
                fields: [

                ],
                footer: { // Footer text
                    text: `Requested by ${msg.member.username}#${msg.member.discriminator}`
                }
            }
        };
        Object.entries(bot.commands).forEach(entry => {
            if (!entry[1].hidden || msg.member.roles.includes('645568403276300299')) {
                helpEmbed.embed.fields.push({
                    name: `.${entry[0]}`,
                    value: entry[1].description
                });
            }
        });
        bot.createMessage(msg.channel.id, helpEmbed);
    } else if (bot.commands[args[0]]) {
        var aliases = '';
        if (bot.commands[args[0]].aliases.length != 0) {
            aliases = '\n **Aliases**: ';
            bot.commands[args[0]].aliases.forEach(alias => {
                aliases = aliases + `.${alias} `;
            });
        }
        var usage = '';
        if (bot.commands[args[0]].usage) {
            usage = `\n **Usage**: ${bot.commands[args[0]].usage}`;
        }
        bot.createMessage(msg.channel.id, `**.${bot.commands[args[0]].label}** - ${bot.commands[args[0]].fullDescription} ${bot.commands[args[0]].usage} ${aliases}`);
    } else {
        bot.createMessage(msg.channel.id, 'Command does not exist.');
    }
}, {
    description: 'This help text',
    fullDescription: "This command is used to view information of different bot commands, including this one.",
    aliases: ['halp']
});

bot.registerCommand("pong", ["Pang!", "Peng!", "Ping!", "Pung!"], { // Make a pong command
    // Responds with a random version of "Ping!" when someone says "!pong"
    description: "Ping!",
    fullDescription: "This command could also be used to check if the bot is responding."
});

bot.registerCommand("approve", (msg, args) => {
    if (msg.member.roles.includes('645509051014184992')) {
        if (args.length == 1) {
            if (discordMention.test(args[0])) {
                bot.createMessage(msg.channel.id, `${args[0]} is now a Developer!`);
                bot.addGuildMemberRole(msg.channel.guild.id, args[0].replace(/[<>@]/g, ''), '645822596994170890', `Approved by ${msg.author.username}`);
            }
        } else {
            if (discordMention.test(args[0])) {
                msg.channel.guild.roles.forEach(role => {
                    if (role.name === args[1]) {
                        bot.createMessage(msg.channel.id, `${args[0]} is now a ${role.name}!`);
                        bot.addGuildMemberRole(msg.channel.guild.id, args[0].replace(/[<>@]/g, ''), `${role.id}`, `Approved by ${msg.author.username}`);
                    }
                });
            }
        }
    }
}, {
    description: 'Staff Only, approves a user to a role',
    fullDescription: 'Staff Only, gives a user the chosen role Role',
    hidden: true,
    usage: '.approve `{@User}` `[Role]',
    aliases: ['dev']
});

bot.registerCommand('mute', (msg, args) => {
    if (discordMention.test(args[0])) {
        var reason = 'With reason: ';
        if (args.length == 1) {
            reason = 'No reason was given.';
        } else {
            args.forEach(arg => {
                if (discordMention.test(arg)) {
                    // do nothing
                } else {
                    reason = `${reason} ${arg}`;
                }
            });
        }
        bot.addGuildMemberRole(msg.channel.guild.id, args[0].replace(/[<>@]/g, ''), '645793523089670165', `Muted by ${msg.author.username}. ${reason}`);
        bot.removeGuildMemberRole(msg.channel.guild.id, args[0].replace(/[<>@]/g, ''), '645508952825528320', `Muted by ${msg.author.username}. ${reason}`);
        bot.getDMChannel(args[0].replace(/[<>@]/g, '')).then(dm => {
            bot.createMessage(dm.id, `You were muted in ${msg.channel.guild.name}. Please re-read the rules. ${reason}`);
        });
        bot.createMessage('645980981144322058', `**<@${msg.member.id}>** muted ${args[0]} for ${msg.channel.guild.name} in <#${msg.channel.id}> for ${reason}`);
        msg.addReaction('👍');
    }
}, {
    description: 'Mod+ Only, mutes a user',
    fullDescription: 'Mod+ Only, mutes a user',
    hidden: true,
    aliases: ['silence', 'shut', 'shh'],
    argsRequired: true
});

bot.registerCommand('hackban', (msg, args) => {
    if (msg.member.roles.includes('645845523332595752')) {
        var t = 1;
        var reason = 'With reason: ';
        if (args.length == 1) {
            reason = 'No reason was given.';
        } else {
            args.forEach(arg => {
                if (t === 1) {
                    t++;
                } else {
                    reason = `${reason} ${arg}`;
                }
            });
        }
        hackban.create({
            userID: args[0],
            modUserID: msg.member.id,
            reason: reason
        }, function (err, hackban) {
            if (err) return handleError(err);
        });
        bot.createMessage('645980981144322058', `**<@${msg.member.id}>** hackbanned ${args[0]} for ${msg.channel.guild.name} in <#${msg.channel.id}> for ${reason}`);
        msg.addReaction('👍');
    }
}, {
    description: 'Admin Only, bans a user',
    fullDescription: 'Admin Only, bans a user who is not currently in the server',
    hidden: true,
    argsRequired: true
});

bot.registerCommand('warn', (msg, args) => {
    if (msg.member.roles.includes('645845523332595752')) {
        if (discordMention.test(args[0])) {
            var reason = 'With reason: ';
            if (args.length == 1) {
                reason = 'No reason was given.';
            } else {
                args.forEach(arg => {
                    if (discordMention.test(arg)) {
                        // do nothing
                    } else {
                        reason = `${reason} ${arg}`;
                    }
                });
            }
            warn.create({
                userID: args[0].replace(/[<>@]/g, ''),
                modUserID: msg.member.id,
                reason: reason
            }, function (err, warn) {
                if (err) return handleError(err);
            });
            bot.createMessage('645980981144322058', `**<@${msg.member.id}>** warned ${args[0]} for ${msg.channel.guild.name} in <#${msg.channel.id}> for ${reason}`);
            bot.getDMChannel(args[0].replace(discordMention, '')).then(dm => {
                bot.createMessage(dm.id, `You were warned in ${msg.channel.guild.name}. Please re-read the rules ${reason}`);
                msg.addReaction('👍');
                warn.find({
                    userID: args[0].replace(discordMention, '')
                }).then(warns => {
                    if (warns.length == 3) {
                        bot.createMessage(dm.id, `You were kicked from ${msg.channel.guild.name} for having too many warns. Please re-read the rules.`);
                        msg.channel.guild.members.get(warns[0].userID).kick('Too many warns.');
                    } else if (warns.length == 5) {
                        bot.createMessage(dm.id, `You were banned from ${msg.channel.guild.name} for having too many warns.`);
                        msg.channel.guild.members.get(warns[0].userID).ban(0, 'Too many warns.');
                    }
                });
            });

        }
    }
}, {
    description: 'Mod+ Only, warns a user',
    fullDescription: 'Mod+ Only, warns a user who is not currently in the server',
    hidden: true,
    argsRequired: true,
    usage: '.warn `{@User}` reason'
});

bot.registerCommand('ban', (msg, args) => {
    if (msg.member.roles.includes('645845523332595752')) {
        if (discordMention.test(args[0])) {
            var reason = 'With reason: ';
            if (args.length == 1) {
                reason = 'No reason was given.';
            } else {
                args.forEach(arg => {
                    if (discordMention.test(arg)) {
                        // do nothing
                    } else {
                        reason = `${reason} ${arg}`;
                    }
                });
            }
            bot.getDMChannel(args[0].replace(/[<>@]/g, '')).then(dm => {
                bot.createMessage(dm.id, `You were banned from ${msg.channel.guild.name}. ${reason}`);
                bot.banGuildMember(msg.channel.guild.id, args[0].replace(/[<>@]/g, ''), 1, reason);
            });
            bot.createMessage('645980981144322058', `**<@${msg.member.id}>** banned ${args[0]} for ${msg.channel.guild.name} in <#${msg.channel.id}> for ${reason}`);
            msg.addReaction('👍');
        }
    }
}, {
    description: 'Mod+ Only, bans a user',
    fullDescription: 'Mod+ Only, bans a user',
    hidden: true,
    argsRequired: true
});

bot.registerCommand('hello', (msg) => {
    bot.createMessage(msg.channel.id, `Hello ${msg.author.username + '#' + msg.author.discriminator}`);
}, {
    description: "Says hello. Duh.",
    fullDescription: "Help!!! Hello?"
});

bot.registerCommand('membercount', (msg) => {
    memC = 0;
    msg.channel.guild.members.forEach(member => {
        if (member.roles.includes('645508952825528320')) {
            memC++;
        }
    });
    bot.createMessage(msg.channel.id, `${msg.channel.guild.name} currently has ${memC} users who have accepted the rules and ${msg.channel.guild.memberCount} members in total!`);
}, {
    description: "Prints the member count of the server.",
    fullDescription: "Prints the member count of the server"
});

bot.registerCommand('info', (msg) => {
    bot.createMessage(msg.channel.id, {
        embed: {
            title: "YACMB", // Title of the embed
            description: "YACMB: **Yet Another Custom Moderation Bot**, by lucy#8008",
            color: 0x008000, // Color, either in hex (show), or a base-10 integer
            fields: [ // Array of field objects
                {
                    name: "Bot Authour", // Field title
                    value: "lucy#8008", // Field
                    inline: true // Whether you want multiple fields in same line
                },
                {
                    name: "Bot Uptime",
                    value: format().toString(),
                    inline: true
                }
            ],
            footer: { // Footer text
                text: `Requested by ${msg.member.username}#${msg.member.discriminator}`
            }
        }
    });
}, {
    description: "Shows a quick embed with bot info",
    fullDescription: "Shows an embed with info about the bot"
});

bot.registerCommand('uptime', (msg) => {
    bot.createMessage(msg.channel.id, format());
}, {
    description: "Prints uptime",
    fullDescription: "How long has the bot been up?"
});

bot.registerCommand('warm', (msg, args) => {
    if (discordMention.test(args[0])) {
        var celsius = Math.floor(Math.random() * (57 - 22 + 1) + 22);
        var fahrenheit = Math.floor(9.0 / 5.0 * celsius + 32);
        var kelvin = Math.floor(celsius + 273.15);
        bot.createMessage(msg.channel.id, `${args[0]} warmed. User is now ${celsius}°C (${fahrenheit}°F, ${kelvin}K).`);
    } else {
        bot.createMessage(msg.channel.id, 'Invalid usage. Do `.help warm` to view proper usage.');
    }
}, {
    fullDescription: "Warms a user :3",
    description: "Warms a user :3",
    hidden: true,
    argsRequired: true
});

bot.registerCommand('chill', (msg, args) => {
    if (discordMention.test(args[0])) {
        var celsius = Math.floor(Math.random() * (-57 - 15 + 1) + 15);
        var fahrenheit = Math.floor(9.0 / 5.0 * celsius + 32);
        var kelvin = Math.floor(celsius + 273.15);
        bot.createMessage(msg.channel.id, `${args[0]} chilled. User is now ${celsius}°C (${fahrenheit}°F, ${kelvin}K).`);
    } else {
        bot.createMessage(msg.channel.id, 'Invalid usage. Do `.help chill` to view proper usage.');
    }
}, {
    fullDescription: "Chills a user >:3",
    description: "Chills a user >:3",
    hidden: true,
    argsRequired: true
});

bot.registerCommand('bam', (msg, args) => {
    if (discordMention.test(args[0])) {
        bot.createMessage(msg.channel.id, `${args[0]} is no̴w̴ ̴b̸&̴.̴ ̷👍👍`);
    } else {
        bot.createMessage(msg.channel.id, 'Invalid usage. Do `.help bam` to view proper usage.');
    }
}, {
    fullDescription: "Bams a user owo",
    description: "Bams a user owo",
    hidden: true,
    argsRequired: true
});

bot.registerCommand('memebercount', `There's like, uhhhhh a bunch 🤷`, {
    description: "Displays user count",
    fullDescription: "Displays user count",
    hidden: true
});

bot.registerCommand('userinfo', (msg, args) => {
    if (msg.member.roles.includes('645509051014184992')) {
        var member = msg.channel.guild.members.get(args[0]);
        if (member) {
            if (member.nick) {
                // do nothing
            } else {
                member.nick = member.username;
            }
            var infoEmbed = {
                content: `user = ${member.username}#${member.discriminator} \n id = ${member.id} \n avatar = https://cdn.discordapp.com/avatars/${member.id}/${member.user.avatar}.png?size=1024 \n bot = ${member.user.bot} \n createdAt = ${new Date(member.user.createdAt).toUTCString()} \n joinedAt = ${new Date(member.joinedAt).toUTCString()} \n displayName = ${member.nick}`,
                embed: {
                    title: `User log for ${member.username}#${member.discriminator}`, // Title of the embed
                    color: 0x008000, // Color, either in hex (show), or a base-10 integer
                    fields: [

                    ],
                    footer: { // Footer text
                        text: `Requested by ${msg.member.username}#${msg.member.discriminator}`
                    }
                }
            };
            warn.find({
                userID: args[0]
            }).then(warns => {
                warns.forEach(warnDoc => {
                    infoEmbed.embed.fields.push({
                        name: `Warn #${infoEmbed.embed.fields.length + 1}`,
                        value: `By ${msg.channel.guild.members.get(warnDoc.modUserID).username}#${msg.channel.guild.members.get(warnDoc.modUserID).discriminator} - ${warnDoc.reason}`
                    });
                });
                mute.find({
                    userID: args[0]
                }).then(mutes => {
                    mutes.forEach(muteDoc => {
                        infoEmbed.embed.fields.push({
                            name: `Warn #${infoEmbed.embed.fields.length + 1}`,
                            value: `By ${msg.channel.guild.members.get(muteDoc.modUserID).username}#${msg.channel.guild.members.get(muteDoc.modUserID).discriminator} - ${muteDoc.reason}`
                        });
                    });
                    if (infoEmbed.embed.fields.length == 0) {
                        infoEmbed.embed.fields.push({
                            name: `No events for this user.`,
                            value: '​'
                        });
                        infoEmbed.embed.color = 0x41eb2a;
                    } else {
                        infoEmbed.embed.color = 0xe02619;
                    }
                    bot.createMessage(msg.channel.id, infoEmbed);
                });

            });
        } else {
            bot.createMessage(msg.channel.id, `Invalid usage.`);
        }
    } else {
        bot.createMessage(msg.channel.id, `<@${msg.member.id}>: Check failed. You might not have the right permissions to run this command.`);
    }
}, {
    description: "Staff only, returns user info",
    fullDescription: "Staff only, returns user info",
    argsRequired: true,
    hidden: true,
    usage: '.userinfo `{UserID}`'
});

bot.registerCommand('award', (msg, args) => {
    if (msg.member.roles.includes('645509051014184992')) {
        leader.findOneAndUpdate({
            userID: args[0].replace(discordMention, '')
        }, {
            $inc: {
                points: args[1]
            }
        }, {
            upsert: true,
            new: true
        }).then(user => {
            leader.find({}).sort('-points').then(leaderboard => {
                let embed = {
                    content: `This season ends on Jan 1st, 2020. Information pinned in <#645762073111953410>`,
                    embed: {
                        title: `${msg.channel.guild.name} Leaderboard`, // Title of the embed
                        description: `The race to **Code God** has begun!`,
                        color: 0x008000, // Color, either in hex (show), or a base-10 integer
                        fields: [ // Array of field objects
                            {
                                name: "`#1`", // Field title
                                value: `${msg.channel.guild.members.get(leaderboard[0].userID).username} - ${leaderboard[0].points} points`, // Field
                            }
                        ],
                        footer: { // Footer text
                            text: `Last updated by ${msg.member.username}#${msg.member.discriminator}`
                        }
                    }
                };
                count = 1;
                leaderboard.forEach(position => {
                    if (count === 1) {
                        count++;
                    } else {
                        try{
                        embed.embed.fields.push({
                            name: "`#" + count + "`",
                            value: `${msg.channel.guild.members.get(position.userID).username} - ${position.points} points`
                        });
                    }
                    catch(error){}
                        count++;
                    }
                });
                bot.editMessage('646930354447319040', msg.channel.guild.channels.get('646930354447319040').lastMessageID, embed);
            });
        });
    }
}, {
    description: "Staff only, awards users points",
    fullDescription: "Staff only, awards users points",
    argsRequired: true,
    hidden: true,
    usage: '\n **Usage** - .award `{@User}` `{Points}`'
});

bot.registerCommand('reset', (msg, args) => {
    if (msg.member.roles.includes('645509051014184992')) {
        if (discordMention.test(args[0])) {
            leader.findOneAndDelete({
                userID: args[0].replace(discordMention, '')
            }).then(() => {
                leader.find().sort('-points').then(leaderboard => {
                    let embed = {
                        content: `This season ends on Jan 1st, 2020. Information pinned in <#645762073111953410>`,
                        embed: {
                            title: `${msg.channel.guild.name} Leaderboard`, // Title of the embed
                            description: `The race to **Code God** has begun!`,
                            color: 0x008000, // Color, either in hex (show), or a base-10 integer
                            fields: [ // Array of field objects
                                {
                                    name: "`#1`", // Field title
                                    value: `${msg.channel.guild.members.get(leaderboard[0].userID).username} - ${leaderboard[0].points} points`, // Field
                                }
                            ],
                            footer: { // Footer text
                                text: `Last updated by ${msg.member.username}#${msg.member.discriminator}`
                            }
                        }
                    };
                    let count = 1;
                    leaderboard.forEach(position => {
                        if (count === 1) {
                            count++;
                        } else {
                            try{
                            embed.embed.fields.push({
                                name: "`#" + count + "`",
                                value: `${msg.channel.guild.members.get(position.userID).username} - ${position.points} points`
                            });
                        }
                        catch(error){

                        }
                            count++;
                        }
                    });
                    bot.editMessage('646930354447319040', msg.channel.guild.channels.get('646930354447319040').lastMessageID, embed);
                    msg.addReaction('👍');
                });
            });
        } else if (args[0] == 'yes-im-sure') {
            leader.remove({}).then(() => {
                msg.addReaction('👍');
            });
        }
    }
}, {
    description: "Staff only, resets a user or the whole leaderboard",
    fullDescription: "Staff only, resets a user or the whole leaderboard",
    argsRequired: true,
    hidden: true,
    usage: '\n **Usage** - .reset `[@User]` || [yes-im-sure]'
});

bot.registerCommand('delwarn', (msg, args) => {
    if (msg.member.roles.includes('645845523332595752')) {
        if (discordMention.test(args[0])) {
            warn.find({
                userID: args[0].replace(discordMention, '')
            }).then(warnings => {
                let event = 0 + (args[1] - 1);
                warn.deleteOne({
                    _id: warnings[event]._id
                }).then(() => {
                    msg.addReaction('👍');
                });
            });
        }
    }
}, {
    description: "Mod+ only, removes a users warn",
    fullDescription: "Mod+ only, removes a users warn",
    argsRequired: true,
    hidden: true,
    usage: '\n **Usage** - .warn `{@User}`'
});

bot.registerCommand('speak', (msg, args) => {
    if (msg.member.roles.includes('645845523332595752')) {
        if (discordChannel.test(args[0])) {
            let ite = 0;
            let speach = ``;
            args.forEach(arg => {
                if (ite === 0) {
                    ite++;
                } else {
                    speach = `${speach} ${arg}`;
                }
            });
            bot.createMessage(args[0].replace(discordChannel, ''), speach);
        }
    }
}, {
    description: "speak",
    fullDescription: "*nuzzles you*",
    argsRequired: true,
    hidden: true
});

bot.registerCommand('join', (msg, args) => {
    bot.joinVoiceChannel(args[0]).then(connecton => {
        let stream = ytdl(args[1], {
            audioonly: true
        });
        connecton.play(stream);
    });
}, {
    description: "speak",
    fullDescription: "*nuzzles you*",
    argsRequired: true,
    hidden: true
});

bot.registerCommand('eval', (msg, args) => {
    if (msg.member.roles.includes('645568403276300299')) {
        let evalCode = '';
        args.forEach(eva => {
            evalCode = `${evalCode} ${eva}`;
        });
        bot.createMessage(msg.channel.id, eval(evalCode));
    }
}, {
    description: "fuck off",
    fullDescription: "*uwu*",
    argsRequired: true,
    hidden: true
});

bot.connect();
