const commandFiles = [
    { category: "📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗", 
commands: ['ai', 'blackbox', 'copilot', 'gemini', 'gpt', 'translate'] },

    { category: "🖼 | 𝙸𝚖𝚊𝚐𝚎", 
commands: ['imagine', 'pinterest', 'removebg', 'remini'] },

    { category: "🎧 | 𝙼𝚞𝚜𝚒𝚌", 
commands: ['lyrics', 'spotify'] },

    { category: "👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜", 
commands: ['tempmail', 'tid', 'uid', 'unsend', 'help', 'alldl'] }

];

const commandFilesWithPaths = commandFiles.flatMap(({ category, commands }) =>
    commands.map(command => ({
        path: `../commands/${category}/${command}.js`,
        name: command
    }))
);

async function loadCommand(filePath) {
    try {
        const { default: commandModule } = await import(filePath);
        return commandModule;
    } catch {
        return null; // Return null silently on error
    }
}

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFilesWithPaths.find(({ name }) => input.startsWith(name));
    const actualPrefix = message.thread?.data?.prefix || global.config.PREFIX;

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command?.config) {
            const args = input.slice(name.length).trim().split(" ");

            const commandParams = {
                message,
                args,
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID,
                prefix: actualPrefix
            };

            if (command.onCall) {
                await command.onCall(commandParams);
            }
            return;
        }
    }
    // Handle command not found without logging
}

export default {
    onCall
};