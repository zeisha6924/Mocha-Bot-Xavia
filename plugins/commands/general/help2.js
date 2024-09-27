const config = {
    name: "help2",
    aliases: ["cmds2", "commands2"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "XaviaTeam"
};

const langData = {
    "en_US": {
        "help2.list": "{list}\n\n⇒ Total: {total} commands\n⇒ Use {syntax} [command] to get more information about a command.",
        "help2.commandNotExists": "Command {command} does not exist.",
        "help2.commandDetails": `
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
            category.push(value._name?.[language] || key);
        }

        const list = Object.entries(commands)
            .map(([category, cmds]) => `⌈ ${category.toUpperCase()} ⌋\n${cmds.join(", ")}`)
            .join("\n\n");

        return message.reply(getLang("help2.list", {
            total: Object.values(commands).reduce((sum, cmds) => sum + cmds.length, 0),
            list,
            syntax: prefix
        }));
    }

    const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
    if (!command || command.isHidden || (command.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) || !command.permissions.some(p => userPermissions.includes(p))) {
        return message.reply(getLang("help2.commandNotExists", { command: commandName }));
    }

    message.reply(getLang("help2.commandDetails", {
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