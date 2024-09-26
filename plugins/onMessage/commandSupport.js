import fs from 'fs';
import path from 'path';

const commandFiles = fs.readdirSync('./plugins/commands/general')
    .filter(file => file.endsWith('.js'));

const commands = commandFiles.map(file => {
    return require(path.join(__dirname, '../commands/general', file)).default;
});

// Function to handle incoming messages and check for commands
export default function onMessage({ message }) {
    const input = message.body.trim();
    const commandPrefix = input.split(" ")[0].toLowerCase(); // Extract command from input

    // Loop through each command to check if it starts with the command name
    commands.forEach(command => {
        const commandName = command.config?.name?.toLowerCase(); // Use optional chaining

        if (commandName && input.toLowerCase().startsWith(commandName)) {
            // Extract the arguments after the command name
            const args = input.slice(commandName.length).trim().split(/ +/); // Split by spaces

            // Check if the command has an onCall function
            if (typeof command.onCall === 'function') {
                command.onCall({ message, args }); // Call the command's onCall function
            } else {
                // If no onCall function exists, handle the command directly
                if (command.handle) {
                    command.handle({ message }); // Call a handle function if it exists
                }
            }
        } else if (!command.config) {
            // Handle commands without a config object directly
            if (typeof command === 'function') {
                command({ message }); // Directly call the command if it's a function
            }
        }
    });
}