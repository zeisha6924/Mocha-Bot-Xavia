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

async function onCall({ message, args }) {
    const id = message.senderID; // User ID
    if (!args.length) {
        await message.reply("🗨️✨ | 𝙲𝚘𝚙𝚒𝚕𝑜𝚝\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
        return;
    }

    let query = args.join(" ");
    const previousResponse = previousResponses.get(id); // Get the previous response for the user

    // If there's a previous response, handle it as a follow-up
    if (previousResponse) {
        query = `Follow-up on: "${previousResponse}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query
        const response = await axios.get(`https://samirxpikachuio.onrender.com/bing?message=${encodeURIComponent(query)}&mode=1&uid=${id}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Extract the reply from the correct path (assuming it's in response.data)
        if (response.data && response.data.message) {
            const copilotResponse = response.data.message;

            // Additional logging for debugging purposes
            console.log(`Sending message: ${copilotResponse}`);

            // Send the extracted message to the user
            await message.send(`🗨️✨ | 𝙲𝚘𝚙𝚒𝚝𝚘𝚝\n━━━━━━━━━━━━━━━━\n${copilotResponse}\n━━━━━━━━━━━━━━━━`);

            // Store the response for follow-up
            previousResponses.set(id, copilotResponse);
        } else {
            console.log("Unexpected response format: ", response.data);
            await message.send("🗨️✨ | 𝙲𝚘𝚙𝚒𝚝𝚘𝚝\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        await message.react(`❎`);
    }
}

export default {
    config,
    onCall
}