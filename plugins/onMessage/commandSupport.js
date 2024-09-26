const commandFiles = [
    { path: '../commands/general/ai.js', name: 'ai' },
    { path: '../commands/general/gemini.js', name: 'gemini' },
    { path: '../commands/general/gpt.js', name: 'gpt' },
    { path: '../commands/general/help.js', name: 'help' },
    { path: '../commands/general/imagine.js', name: 'imagine' },
    { path: '../commands/general/lyrics.js', name: 'lyrics' },
    { path: '../commands/general/pinterest.js', name: 'pinterest' },
    { path: '../commands/general/remini.js', name: 'remini' },
    { path: '../commands/general/spotify.js', name: 'spotify' },
    { path: '../commands/general/tid.js', name: 'tid' },
    { path: '../commands/general/translate.js', name: 'translate' },
    { path: '../commands/general/uid.js', name: 'uid' },
    { path: '../commands/general/unsend.js', name: 'unsend' },
    // Add future commands here
];

async function loadCommand(filePath) {
    try {
        const commandModule = await import(filePath);
        return commandModule.default;
    } catch (error) {
        console.error(`Failed to load command script from ${filePath}:`, error);
        return null;
    }
}

async function onCall({ message, prefix }) {
    const input = message.body.trim();

    for (const { path, name } of commandFiles) {
        if (input.toLowerCase().startsWith(`${prefix}${name}`)) {
            const command = await loadCommand(path);

            if (command) {
                const args = input.slice(`${prefix}${name}`.length).trim().split(" ");

                if (command.onCall) {
                    await command.onCall({
                        message,
                        args,
                        getLang: (key) => key,
                        data: {},
                        userPermissions: message.senderID,
                        prefix
                    });
                    return;
                } else {
                    console.log(`Command ${name} does not have an onCall function.`);
                }
            }
        }
    }

    console.log("No valid command found for input:", input);
}

export default {
    onCall
};