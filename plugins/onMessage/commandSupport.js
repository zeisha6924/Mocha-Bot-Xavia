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
        return commandModule.default; // Return the default export of the command
    } catch (error) {
        console.error(`Failed to load command script from ${filePath}:`, error);
        return null; // Return null if loading fails
    }
}

async function onCall({ message, prefix }) {
    const input = message.body.trim();

    for (const { path, name } of commandFiles) {
        // Check if the input starts with the prefix followed by the command name
        if (input.toLowerCase().startsWith(`${prefix}${name}`)) {
            const command = await loadCommand(path);

            if (command && command.config) {
                const args = input.slice(`${prefix}${name}`.length).trim().split(" "); // Get the arguments for the command

                // Call the command's onCall function
                await command.onCall({
                    message,
                    args,
                    getLang: (key) => key, // Placeholder for getLang function, modify as needed
                    data: {}, // Add relevant data if required
                    userPermissions: message.senderID, // Assuming senderID is used for permissions
                    prefix // Pass the prefix to the command
                });
                return; // Exit after processing the command
            }
        }
    }

    // If no command was found, you can send a default message or perform another action
    console.log("No valid command found for input:", input);
}

export default {
    onCall
};