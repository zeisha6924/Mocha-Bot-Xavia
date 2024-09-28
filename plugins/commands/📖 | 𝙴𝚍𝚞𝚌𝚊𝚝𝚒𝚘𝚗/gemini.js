import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Fetch answers using Gemini API.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const id = message.senderID; // Retrieve user ID
    const query = args.length ? args.join(" ") : "hi"; // Use "hi" if no query is provided

    try {
        await message.react("🕰️"); // Show processing indicator

        const typ = global.api.sendTypingIndicator(message.threadID); // Send typing indicator

        // Call the Gemini API
        const response = await samirapi.gemini(query, id);

        typ(); // Stop typing indicator

        // Send formatted response or handle errors
        await handleResponse(message, response);
    } catch (error) {
        console.error("API call failed: ", error); // Log error
        await message.react("❎"); // Indicate error
        await sendErrorMessage(message);
    }
}

async function handleResponse(message, response) {
    // Check if the response is valid
    if (response) {
        await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`); // Send the formatted response
        await message.react("✅"); // Indicate success
    } else {
        throw new Error("Unexpected response format from API."); // Throw error for invalid response
    }
}

async function sendErrorMessage(message) {
    // Send error message with header and footer
    await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━`);
}

export default {
    config,
    onCall,
};