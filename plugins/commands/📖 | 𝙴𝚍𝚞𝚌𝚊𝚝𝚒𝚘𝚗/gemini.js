import samirapi from 'samirapi';

const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Fetch information using Gemini API.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const id = message.senderID; // Retrieve user ID
    if (!args.length) {
        await message.reply("Please provide a query to fetch information.");
        return;
    }

    const query = args.join(" "); // Join the query from arguments

    try {
        await message.react("🕰️"); // React with a clock emoji while processing

        const typ = global.api.sendTypingIndicator(message.threadID); // Send typing indicator

        // Send request to the Gemini API with the query and user ID
        const response = await samirapi.gemini(query, id);

        typ(); // Stop typing indicator

        // Log the response to check its structure
        console.log("API response: ", response);

        await message.send(response); // Send the response back to the user
        await message.react("✅"); // React with a checkmark emoji for success
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        await message.react("❎"); // React with a cross emoji for error
        await message.send("Sorry, I couldn't fetch the information. Please try again later.");
    }
}

export default {
    config,
    onCall,
};