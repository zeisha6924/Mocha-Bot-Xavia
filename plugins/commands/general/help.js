const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
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
        "availableCommands": `
━━━━━━━━━━━━━━━━
𝙰𝚟𝚊𝚒𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:
╭─╼━━━━━━━━╾─╮
│  📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗
│ {educationCommands}
╰─━━━━━━━━━╾─╯
╭─╼━━━━━━━━╾─╮
│  🖼 | 𝙸𝚖𝚊𝚐𝚎
│ {imageCommands}
╰─━━━━━━━━━╾─╯
╭─╼━━━━━━━━╾─╮
│  🎧 | 𝙼𝚞𝚜𝚒𝚌
│ {musicCommands}
╰─━━━━━━━━━╾─╯
╭─╼━━━━━━━━╾─╮
│  👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜
│ {memberCommands}
╰─━━━━━━━━━╾─╯
!help <command name>
𝚃𝚘 𝚜𝚎𝚎 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚝𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.
𝙴𝚡𝚊𝚖𝚙𝚕𝚎: !help gemini
━━━━━━━━━━━━━━━━
        `,
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
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        let educationCommands = [];
        let imageCommands = [];
        let musicCommands = [];
        let memberCommands = [];

        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;

            // Categorize commands based on their category property
            switch (value.category) {
                case "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗":
                    educationCommands.push(`${prefix}${key}`);
                    break;
                case "𝙸𝚖𝚊𝚐𝚎":
                    imageCommands.push(`${prefix}${key}`);
                    break;
                case "𝙼𝚞𝚜𝚒𝚌":
                    musicCommands.push(`${prefix}${key}`);
                    break;
                case "𝙼𝚎𝚖𝚋𝚎𝚛𝚜":
                    memberCommands.push(`${prefix}${key}`);
                    break;
            }
        }

        // Format the command lists
        const formattedMessage = langData['en_US']["availableCommands"]
            .replace("{educationCommands}", educationCommands.length > 0 ? educationCommands.join("\n│ ") : "No commands available.")
            .replace("{imageCommands}", imageCommands.length > 0 ? imageCommands.join("\n│ ") : "No commands available.")
            .replace("{musicCommands}", musicCommands.length > 0 ? musicCommands.join("\n│ ") : "No commands available.")
            .replace("{memberCommands}", memberCommands.length > 0 ? memberCommands.join("\n│ ") : "No commands available.");

        message.reply(formattedMessage);
    } else {
        const resolvedCommandName = getCommandName(commandName);
        const command = commandsConfig.get(resolvedCommandName);

        if (!command) {
            return message.reply(langData['en_US']["help.commandNotExists"].replace("{command}", commandName));
        }

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid) {
            return message.reply(langData['en_US']["help.commandNotExists"].replace("{command}", commandName));
        }

        message.reply(langData['en_US']["help.commandDetails"]
            .replace("{name}", command.name)
            .replace("{description}", command.description || 'No description provided.')
            .replace("{usage}", `${prefix}${resolvedCommandName} ${command.usage || ''}`)
            .replace(/^ +/gm, ''));
    }
}

export default {
    config,
    langData,
    onCall
}