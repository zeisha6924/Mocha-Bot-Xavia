const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "XaviaTeam"
};

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (const [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let commands = {};
        const language = message?.thread?.data?.language || global.config.LANGUAGE || 'en_US';

        for (const [key, value] of commandsConfig.entries()) {
            if (value.isHidden) continue;
            if (value.isAbsolute && !global.config?.ABSOLUTES.some(e => e == message.senderID)) continue;
            if (!value.permissions?.some(p => userPermissions.includes(p))) continue;

            if (!commands[value.category]) commands[value.category] = [];
            commands[value.category].push(`${prefix}${value._name?.[language] || key}`);
        }

        const list = Object.keys(commands)
            .map(category => commands[category].map(cmd => `│ ${cmd}`).join("\n"))
            .join("\n");

        message.reply(`
━━━━━━━━━━━━━━━━
𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:
╭─╼━━━━━━━━╾─╮
${list}
╰─━━━━━━━━━╾─╯
${prefix}help <command name>
𝚃𝚘 𝚜𝚎𝚎 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.
━━━━━━━━━━━━━━━━`);
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(`Command ${commandName} does not exist.`);

        const isHidden = command.isHidden;
        const isUserValid = !command.isAbsolute || global.config?.ABSOLUTES.some(e => e == message.senderID);
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(`Command ${commandName} does not exist.`);

        message.reply(`
━━━━━━━━━━━━━━━━
𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎: ${command.name}
𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: ${command.description || 'No description provided.'}
𝚄𝚜𝚊𝚐𝚎: ${prefix}${commandName} ${command.usage || ''}
━━━━━━━━━━━━━━━━`);
    }
}

export default {
    config,
    onCall
};