const commandFiles = [

    'ai', 'gemini', 'gpt', 'help', 'imagine', 'lyrics', 'pinterest', 
    'remini', 'spotify', 'tid', 'translate', 'uid', 'unsend',
    //  ⬆️ Add or Edit the command names that you want to work without prefix

// Change The Directory Path for the commands you want to be non-prefix ⬇️
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

            await command.onCall({
                message,
                args,
                getLang: (key) => key,
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID,
                prefix: actualPrefix
            });
            return;
        }
    }

    console.log("No valid command found for input:", input);
}

export default {
    onCall
};