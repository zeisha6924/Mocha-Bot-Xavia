import fs from 'fs';
import path from 'path';

const commandsDir = path.resolve(__dirname, '../commands/general');

async function loadCommands() {
    const commandFiles = fs.readdirSync(commandsDir)
        .filter(file => file.endsWith('.js'))
        .map(file => ({
            path: path.join(commandsDir, file),
            name: path.basename(file, '.js')
        }));
    return commandFiles;
}

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
    const commandFiles = await loadCommands();
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFiles.find(({ name }) => input.startsWith(name));

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command && command.config) {
            const args = input.slice(name.length).trim().split(" ");

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