import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["geminiAI"],
    description: "Interact with the Gemini AI model.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;
    const text = args.length ? args.join(" ") : "hi"; // Use 'text' instead of 'query'

    try {
        await message.react("⏰");
        const typ = global.api.sendTypingIndicator(message.threadID);
        
        const response = await samirapi.gemini(text, userId); // Use 'text' as the first parameter

        typ();
        console.log("Gemini API response: ", response);

        await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`);
        await message.react("✅");
    } catch (error) {
        console.error("Gemini API call failed: ", error);
        await message.react("❎");
        await message.send("👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
    }
}

export default {
    config,
    onCall,
};