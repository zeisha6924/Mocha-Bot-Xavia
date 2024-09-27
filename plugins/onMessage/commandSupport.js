const commandFiles = [

    { category: "📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗", commands: 
['ai', 'cai', 'copilot', 'gemini', 'gpt', 'translate'] },

    { category: "🖼 | 𝙸𝚖𝚊𝚐𝚎", commands: 
['imagine', 'pinterest', 'removebg', 'remini'] },

    { category: "🎧 | 𝙼𝚞𝚜𝚒𝚌", commands: 
['lyrics', 'spotify'] },

    { category: "👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜", commands: 
['tempmail', 'tid', 'uid', 'unsend', 'help', 'alldl'] }

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
    } catch (error) {
        console.error(`Failed to load command script from ${filePath}:`, error);
        return null;
    }
}

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFilesWithPaths.find(({ name }) => input.startsWith(name));

    const actualPrefix = message.thread?.data?.prefix || global.config.PREFIX;

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice(name.length).trim().split(" ");

            // Pass in `getLang` to fetch language-specific strings
            const commandParams = {
                message,
                args,
                getLang: (key) => {
                    const langData = command.langData; // Access the langData from the command
                    return langData?.[message.thread?.data?.language]?.[key] || key; // Return the correct language string
                },
                data: { thread: { data: { prefix: actualPrefix } } },
                userPermissions: message.senderID,
                prefix: actualPrefix
            };

            // Check if the command module has an onCall function
            if (command.onCall) {
                await command.onCall(commandParams);
            } else {
                console.warn(`No onCall function defined for command: ${name}`);
            }
            return;
        }
    }
    // Log a message if no command is found
    console.warn(`No command found for input: ${input}`);
}

export default {
    onCall
};