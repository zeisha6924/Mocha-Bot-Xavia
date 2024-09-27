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

// Function to send the query to the API and handle the response
async function sendCopilotQuery({ message, query }) {
    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query
        const response = await axios.get(`https://samirxpikachuio.onrender.com/bing?message=${encodeURIComponent(query)}&mode=1&uid=100`);

        typ();

        // Extract and send the reply
        if (response.data && response.data.message) {
            const copilotResponse = response.data.message;

            // Send the extracted message to the user with the new header
            await message.send(`🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n${copilotResponse}\n━━━━━━━━━━━━━━━━`);
        } else {
            await message.send("🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
        }
    } catch (error) {
        console.error("API call failed: ", error);
        await message.react(`❎`);
    }
}

// Main function for handling the command
async function onCall({ message, args }) {
    if (!args.length) {
        await message.reply("🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
        return;
    }

    const query = args.join(" ");
    await sendCopilotQuery({ message, query });
}

// Function for handling replies (as set up in support.js)
async function onReply({ message }) {
    const query = message.body;
    await sendCopilotQuery({ message, query });
}

export default {
    config,
    onCall,
    onReply,  // Export the onReply function to be used by support.js
};