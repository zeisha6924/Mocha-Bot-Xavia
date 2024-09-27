const config = {
    name: "help2",  // Command name
    aliases: ["cmds2", "commands2"],  // Command aliases
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    category: "Members",  // Added category
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "help.commandNotExists": "Command {command} does not exist.",
        "help.commandDetails": `
━━━━━━━━━━━━━━━━
𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎: {name}
𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: {description}
𝚄𝚜𝚊𝚐𝚎: {usage}
━━━━━━━━━━━━━━━━
        `,
        "0": "Member",
        "1": "Group Admin",
        "2": "Bot Admin"
    }
}

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null;
}

async function onCall({ message, args, userPermissions, prefix, data }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let commands = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;
            if (!commands.hasOwnProperty(value.category)) commands[value.category] = [];
            commands[value.category].push(value._name && value._name[language] ? value._name[language] : key);
        }

        let list = Object.keys(commands)
            .map(category => {
                let emoji = "📖";  // Default emoji
                switch (category.toLowerCase()) {
                    case "education": emoji = "📖"; break;
                    case "image": emoji = "🖼"; break;
                    case "music": emoji = "🎧"; break;
                    case "members": emoji = "👥"; break;
                    // Add more categories and emojis as needed
                }

                return `╭─╼━━━━━━━━╾─╮\n│  ${emoji} | 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚢: ${category}\n│ ${commands[category].map(cmd => `-${prefix}${cmd}`).join("\n│ ")}\n╰─━━━━━━━━━╾─╯`;
            })
            .join("\n\n");

        const responseMessage = `
━━━━━━━━━━━━━━━━
𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:
{list}
-help2 <command name>
𝚃𝚘 𝚜𝚎𝚎 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.
𝙴𝚡𝚊𝚖𝚙𝚕𝚎: -help2 example
━━━━━━━━━━━━━━━━`.replace("{list}", list);

        message.reply(responseMessage);
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(langData['en_US']["help.commandNotExists"].replace("{command}", commandName));

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(langData['en_US']["help.commandNotExists"].replace("{command}", commandName));

        message.reply(langData['en_US']["help.commandDetails"].replace("{name}", command.name).replace("{description}", command.description || 'No description provided.').replace("{usage}", `${prefix}${commandName} ${command.usage || ''}`).replace(/^ +/gm, ''));
    }
}

export default {
    config,
    langData,
    onCall
}