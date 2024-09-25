const commandFiles = [
    '../commands/general/ai.js',
    '../commands/general/gemini.js',
    '../commands/general/gpt.js',
    '../commands/general/help.js',
    '../commands/general/imagine.js',
    '../commands/general/lyrics.js',
    '../commands/general/pinterest.js',
    '../commands/general/remini.js',
    '../commands/general/spotify.js',
    '../commands/general/tid.js',
    '../commands/general/translate.js',
    '../commands/general/uid.js',
    '../commands/general/unsend.js',
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

async function onCall({ message }) {
    const input = message.body.trim();
    const commandName = input.split(" ")[0].toLowerCase(); // Get the command from the message

    for (const filePath of commandFiles) {
        const command = await loadCommand(filePath);
        if (command && command.config.aliases.includes(commandName)) {
            const args = input.slice(commandName.length).trim().split(" "); // Get the arguments for the command
            await command.onCall({
                message,
                args,
                getLang: (key) => key, // Placeholder for getLang function, modify as needed
                data: {}, // Add relevant data if required
                userPermissions: message.senderID, // Assuming senderID is used for permissions
            });
            return; // Exit after processing the command
        }
    }

    // If no command was found, you can send a default message or perform another action
    console.log("No valid command found for input:", input);
}

export default {
    onCall
};