const commandFiles = [
    'ai', 'gemini', 'gpt', 'help', 'imagine', 'lyrics', 'pinterest', 
    'remini', 'spotify', 'tid', 'translate', 'uid', 'unsend',
    'removebg', // Add more command names that import samirapi
].map(name => ({
    path: `../commands/general/${name}.js`,
    name
}));

async function loadCommand(filePath) {
    try {
        const { default: commandModule } = await import(filePath);
        return commandModule;
    } catch (error) {
        console.error(`Failed to load command script from ${filePath}:`, error);
        return null;
    }
}

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFiles.find(({ name }) => input.startsWith(name));

    const actualPrefix = message.thread?.data?.prefix || global.config.PREFIX;

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice(name.length).trim().split(" ");

            // Pass in `samirapi` if it's used in the command
            const commandParams = {
                message,
                args,
                getLang: (key) => key,
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID,
                prefix: actualPrefix
            };

            // Check if the command module uses samirapi and adjust params accordingly
            if (command.onCall) {
                await command.onCall(commandParams);
            } else {
                console.warn(`No onCall function defined for command: ${name}`);
            }
            return;
        }
    }
    // The function ends without logging anything if no command is found
}

export default {
    onCall
};