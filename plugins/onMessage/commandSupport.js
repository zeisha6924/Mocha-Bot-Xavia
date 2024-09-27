const commandFiles = [
    'ai', 'alldl', 'cai', 'copilot', 'gemini', 'gpt', 'help', 'imagine', 
    'lyrics', 'pinterest', 'remini', 'removebg', 'spotify', 
    'tempmail', 'tid', 'translate', 'uid', 'unsend', // Add more command names here
].flatMap(name => [
    {
        path: `../commands/📖 | 𝙴𝚞𝚍𝚊𝚝𝚒𝚘𝚗/${name}.js`,
        name
    },
    {
        path: `../commands/🖼 | 𝙸𝚖𝚊𝚐𝚎/${name}.js`,
        name
    },
    {
        path: `../commands/🎧 | 𝙼𝚞𝚜𝚒𝚌/${name}.js`,
        name
    },
    {
        path: `../commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜/${name}.js`,
        name
    },
]);

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

    console.log(`Input command: ${input}`);
    console.log(`Command entry: ${commandEntry ? commandEntry.name : 'None'}`);

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice(name.length).trim().split(" ");
            const commandParams = {
                message,
                args,
                getLang: (key) => (key in command.langData.en_US ? command.langData.en_US[key] : key), // Get the language string
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID, // Assuming senderID should be an array of permissions
                prefix: actualPrefix
            };

            if (command.onCall) {
                await command.onCall(commandParams);
            } else {
                console.warn(`No onCall function defined for command: ${name}`);
            }
            return;
        }
    }
    console.warn(`No command found for input: ${input}`);
}

export default {
    onCall
};