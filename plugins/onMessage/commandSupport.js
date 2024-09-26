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

function getRealPrefix(data) {
    return data?.thread?.data?.prefix || global.config.PREFIX || "";
}

async function onCall({ message }) {
    const prefix = getRealPrefix(message.data); // Get the real prefix
    const input = message.body.trim().toLowerCase();

    const commandEntry = commandFiles.find(({ name }) => input.startsWith(prefix + name));

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice((prefix + name).length).trim().split(" ");

            await command.onCall({
                message,
                args,
                getLang: (key) => key, // Placeholder for getLang function, modify as needed
                data: {}, // Add relevant data if required
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