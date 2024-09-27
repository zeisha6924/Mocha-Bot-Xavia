const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "XaviaTeam"
};

const langData = {
    "en_US": {
        "help.commandNotExists": "Command {command} does not exist.",
        "help.commandDetails": `
            ⇒ Name: {name}
            ⇒ Aliases: {aliases}
            ⇒ Version: {version}
            ⇒ Description: {description}
            ⇒ Usage: {usage}
            ⇒ Category: {category}
            ⇒ Permissions: {permissions}
            ⇒ Cooldown: {cooldown}
            ⇒ Credits: {credits}
        `,
        "0": "Member",
        "1": "Group Admin",
        "2": "Bot Admin"
    }
};

function getCommandName(commandName) {
    return global.plugins.commandsAliases.has(commandName) 
        ? commandName 
        : Array.from(global.plugins.commandsAliases).find(([key, aliases]) => aliases.includes(commandName))?.[0] 
        || null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        const commands = {};

        for (const [key, value] of commandsConfig.entries()) {
            if (value.isHidden || (value.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) || !value.permissions?.some(p => userPermissions.includes(p))) continue;
            const category = commands[value.category] || (commands[value.category] = []);
            category.push(`- ${value._name?.[language] || key}`);
        }

        // Arrange categories in the specified order
        const orderedCategories = ["📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗", "🖼 | 𝙸𝚖𝚊𝚐𝚎", "🎧 | 𝙼𝚞𝚜𝚒𝚌", "👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜"];
        const commandList = orderedCategories
            .filter(category => commands[category])
            .map(category => `
╭─╼━━━━━━━━╾─╮
│  ${category}
│ ${commands[category].join("\n│ ")}
╰─━━━━━━━━━╾─╯`)
            .join("");

        return message.reply(commandList);
    }

    const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
    if (!command || command.isHidden || (command.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) || !command.permissions.some(p => userPermissions.includes(p))) {
        return message.reply(getLang("help.commandNotExists", { command: commandName }));
    }

    message.reply(getLang("help.commandDetails", {
        name: command.name,
        aliases: command.aliases.join(", "),
        version: command.version || "1.0.0",
        description: command.description || '',
        usage: `${prefix}${commandName} ${command.usage || ''}`,
        category: command.category,
        permissions: command.permissions.map(p => getLang(String(p))).join(", "),
        cooldown: command.cooldown || 3,
        credits: command.credits || ""
    }).replace(/^ +/gm, ''));
}

export default {
    config,
    langData,
    onCall
};