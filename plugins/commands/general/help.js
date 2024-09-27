const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "XaviaTeam",
    category: "Members" // Added category
};

const langData = {
    "en_US": {
        "help.list": "━━━━━━━━━━━━━━━━\n𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:\n{categories}\n%1help <command name>\n𝚃𝚘 𝚜𝚎𝚎 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚝𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: %1help gemini\n━━━━━━━━━━━━━━━━",
        "help.commandNotExists": "Command {command} does not exist.",
        "help.commandDetails": "━━━━━━━━━━━━━━━━\n𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎: {name}\n𝙳𝚎𝚜𝚌𝚛𝚒𝚋𝚝𝚒𝚘𝚗: {description}\n𝚄𝚜𝚊𝚐𝚎: {usage}\n━━━━━━━━━━━━━━━━",
        "0": "Member",
        "1": "Group Admin",
        "2": "Bot Admin"
    }
};

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let categories = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        
        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;

            if (!categories.hasOwnProperty(value.category)) categories[value.category] = [];
            categories[value.category].push(key); // Using key for category output
        }

        let categoryOutput = Object.keys(categories)
            .map(category => `╭─╼━━━━━━━━╾─╮\n│  ${getCategoryEmoji(category)} | ${category}\n│ ${categories[category].join('\n│ ')}\n╰─━━━━━━━━━╾─╯`)
            .join("\n");

        message.reply(getLang("help.list", {
            categories: categoryOutput
        }));
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(getLang("help.commandNotExists", { command: commandName }));

        message.reply(getLang("help.commandDetails", {
            name: command.name,
            description: command.description || '',
            usage: `${prefix}${commandName} ${command.usage || ''}`
        }).replace(/^ +/gm, ''));
    }
}

function getCategoryEmoji(category) {
    switch (category) {
        case 'Education': return '📖';
        case 'Image': return '🖼';
        case 'Music': return '🎧';
        case 'Members': return '👥';
        default: return '';
    }
}

export default {
    config,
    langData,
    onCall
};