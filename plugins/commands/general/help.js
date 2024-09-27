import fs from 'fs';
import path from 'path';

// Deriving the directory name in ES Module
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Path to your command files
const commandsDir = path.resolve(__dirname, '../general');

const config = {
    name: "help",
    aliases: ["commands"],
    version: "1.0.0",
    description: "Lists all available commands.",
    usage: "",
    category: "𝙴𝚞𝚍𝚊𝚌𝚒𝚘𝚗",
    credits: "Your Name"
};

async function onCall({ message }) {
    const commandsConfig = new Map();

    // Read all files in the commands directory
    const files = fs.readdirSync(commandsDir);

    // Load each command file
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const commandModule = await import(path.join(commandsDir, file));
                if (commandModule && commandModule.config) {
                    commandsConfig.set(commandModule.config.name, commandModule.config);
                } else {
                    console.warn(`Warning: The command file ${file} does not export a valid config object.`);
                }
            } catch (error) {
                console.error(`Error loading command file ${file}:`, error);
            }
        }
    }

    // Categorize commands
    const categorizedCommands = {
        "𝙴𝚞𝚍𝚊𝚌𝚒𝚘𝚗": [],
        "𝙸𝚖𝚊𝚐𝚎": [],
        "𝙼𝚞𝚜𝚒𝚌": [],
        "𝙼𝚎𝚖𝚋𝚎𝚛𝚜": []
    };

    for (const command of commandsConfig.values()) {
        if (categorizedCommands[command.category]) {
            categorizedCommands[command.category].push(command.name);
        }
    }

    // Prepare the response message
    let responseMessage = "━━━━━━━━━━━━━━━━\n";
    responseMessage += "𝙰𝚟𝚊𝚒𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚝𝚜:\n";

    for (const [category, commands] of Object.entries(categorizedCommands)) {
        if (commands.length > 0) {
            responseMessage += `╭─╼━━━━━━━━╾─╮\n`;
            responseMessage += `│  ${getCategoryEmoji(category)} | ${category}\n`;
            responseMessage += commands.map(cmd => `│ !${cmd}`).join('\n') + '\n';
            responseMessage += `╰─━━━━━━━━━╾─╯\n`;
        }
    }

    responseMessage += "!help <command name>\n";
    responseMessage += "𝚃𝚘 𝚜𝚎𝚎 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚝𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.\n";
    responseMessage += "𝙴𝚡𝚊𝚖𝚙𝚕𝚎: !help gemini\n";
    responseMessage += "━━━━━━━━━━━━━━━━";

    // Send the response
    message.reply(responseMessage);
}

// Helper function to get category emoji
function getCategoryEmoji(category) {
    switch (category) {
        case "𝙴𝚞𝚍𝚊𝚌𝚒𝚘𝚗":
            return "📖";
        case "𝙸𝚖𝚊𝚐𝚎":
            return "🖼";
        case "𝙼𝚞𝚜𝚒𝚌":
            return "🎧";
        case "𝙼𝚎𝚖𝚋𝚎𝚛𝚜":
            return "👥";
        default:
            return "❓";
    }
}

export default {
    config,
    onCall
};