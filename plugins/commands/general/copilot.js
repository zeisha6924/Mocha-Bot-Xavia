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

const previousResponses = new Map(); // Map to store previous responses for each user
const header = "🗨️✨ | 𝙲𝚘𝚙𝚒𝚝𝚘𝚝"; // Header for bot messages
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
    // Check if the reply is to a previous message from the bot with the specific header
    const originalMessage = await message.getOriginal(); // Fetch the original message being replied to
    if (originalMessage && originalMessage.body.startsWith(header)) {
        const query = message.body; // Get the reply content

        // Trigger the follow-up functionality with the new message as a query
        await onCall({ message, args: query.split(" ") }); // Call onCall with the reply
    }
}

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
    onReply, // Ensure to export the onReply function
};