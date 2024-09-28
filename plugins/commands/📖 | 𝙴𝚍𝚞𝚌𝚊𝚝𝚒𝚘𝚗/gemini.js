import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Interacts with the Gemini AI model.",
    usage: "[text]",
    cooldown: 3,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userText = args.join(" ") || "hi"; // Use "hi" as default if no query is provided

    await message.react("🕰️"); // Indicate processing

    const userId = message.from; // Assuming `message.from` is the user's ID

    try {
        const response = await samirapi.gemini(userText, userId);
        await message.reply(response); // Send back the response
        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply("An error occurred while interacting with the Gemini AI."); // Error message
    }
}

export default {
    config,
    onCall,
};