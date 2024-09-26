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

function replaceUndefinedPrefix(commandName, prefix) {
    return commandName.replace(/^undefined/, prefix);
}

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFiles.find(({ name }) => input.startsWith(name));

    // Get the actual prefix (replace this with your actual prefix retrieval logic)
    const actualPrefix = message.thread?.data?.prefix || global.config.PREFIX;

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice(name.length).trim().split(" ");
            await command.onCall({
                message,
                args,
                getLang: (key) => key, // Placeholder for getLang function, modify as needed
                data: { thread: { data: { prefix: actualPrefix } } }, // Pass the actual prefix to commands
                userPermissions: message.senderID, // Assuming senderID is used for permissions
            });
            return;
        }
    }

    console.log("No valid command found for input:", input);
}

export default {
    onCall
};