import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["bard"],
    description: "Ask a question to the Google Gemini.",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "RN",
};

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args }) {
    const query = args.length ? args.join(" ") : "Hi"; // Default to "Hi" if no query is provided
    const id = message.senderID;

    // If there's a previous response, handle it as a follow-up
    if (previousResponses.has(id)) {
        query = `Follow-up on: "${previousResponses.get(id)}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);
        const response = await samirapi.gemini(query, id);
        typ();

        // Extract the reply from the response
        if (response?.gemini) {
            const geminiResponse = response.gemini;
            await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${geminiResponse}\n━━━━━━━━━━━━━━━━`);
            previousResponses.set(id, geminiResponse); // Store the response for follow-up
        } else {
            await message.send("👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
        }
    } catch (error) {
        console.error("API call failed: ", error);
        message.react(`❎`);
    }
}

export default {
    config,
    onCall
};