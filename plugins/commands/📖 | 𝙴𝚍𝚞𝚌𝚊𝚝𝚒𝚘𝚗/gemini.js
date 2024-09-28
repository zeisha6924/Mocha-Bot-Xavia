import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["geminiAI"],
    description: "Interact with the Gemini AI model.",
    usage: "[text]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;
    const text = args.length ? args.join(" ") : "hi"; 

    try {
        await message.react("⏰");
        const typ = global.api.sendTypingIndicator(message.threadID);
        
        const response = await samirapi.gemini(text, userId);

        typ();
        console.log("Gemini API response: ", response);

        // Convert the response to a string or access a specific property
        const responseText = typeof response === 'object' ? JSON.stringify(response, null, 2) : response;

        await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━`);
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