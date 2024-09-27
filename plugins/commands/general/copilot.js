import axios from 'axios';

const config = {
    name: "copilot",
    aliases: ["bing"],
    description: "Ask a question to the Bing Copilot",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

const previousResponses = new Map(); // Map to store previous responses for each thread
const header = "🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝"; // Header for bot messages
const uid = 100; // Set UID as required

async function onCall({ message, args }) {
    if (!args.length) {
        await message.reply(`${header}\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━`);
        return;
    }

    let query = args.join(" ");

    // If the query is a follow-up to a previous message
    if (previousResponses.has(message.threadID)) {
        query = `Follow-up: "${previousResponses.get(message.threadID)}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query using the specified URL format
        const response = await axios.get(`https://samirxpikachuio.onrender.com/bing?message=${encodeURIComponent(query)}&mode=1&uid=${uid}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Directly use the response data assuming it's at the top level
        const copilotResponse = response.data; // Update this line

        // Additional logging for debugging purposes
        console.log(`Sending message: ${copilotResponse}`);

        // Send the extracted message to the user with the specific header
        const msgData = await message.send(`${header}\n━━━━━━━━━━━━━━━━\n${copilotResponse}\n━━━━━━━━━━━━━━━━`);

        // Store the response for follow-up
        previousResponses.set(message.threadID, copilotResponse); // Store the last response per thread
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        await message.react(`❎`);
    }
}

/** @type {TReplyCallback} */
async function onReply({ message }) {
    const originalMessage = await message.getOriginal(); // Fetch the original message being replied to
    if (originalMessage && originalMessage.body.startsWith(header)) {
        const query = message.body; // Get the reply content
        await onCall({ message, args: query.split(" ") }); // Call onCall with the reply
    }
}

// Function to capture all messages and store them
export default function ({ message }) {
    const { body, messageID, senderID, attachments } = message;

    // Log the message details if necessary
    global.data.messages.push({
        body,
        messageID,
        senderID,
        attachments
    });

    // Process the reply if it's a reply to a bot message
    if (message.isReply) {
        onReply({ message });
    } else {
        // Process normal command
        const args = body.split(" ").slice(1); // Assuming the command starts with the bot's name
        if (body.startsWith(config.name)) {
            onCall({ message, args });
        }
    }
}