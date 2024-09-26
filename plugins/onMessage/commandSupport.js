const commandFiles = [
    'ai', 'gemini', 'gpt', 'help', 'imagine', 'lyrics', 'pinterest', 
    'remini', 'spotify', 'tid', 'translate', 'uid', 'unsend',
    // Add future commands here
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
    const actualPrefix = message.thread?.data?.prefix || global.config.PREFIX;

    // Ensure to check against commands with the actual prefix
    const commandEntry = commandFiles.find(({ name }) => input.startsWith(`${name} `) || input === name);

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            // Remove the prefix and command name from input
            const args = input.replace(`${name} `, '').trim().split(" ");

            // Pass the actual prefix in the data object
            await command.onCall({
                message,
                args,
                getLang: (key) => key, // Placeholder for getLang function, modify as needed
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID, // Assuming senderID is used for permissions
                prefix: actualPrefix // Pass the prefix directly to commands
            });
            return;
        }
    }

    console.log("No valid command found for input:", input);
}

export default {
    onCall
};