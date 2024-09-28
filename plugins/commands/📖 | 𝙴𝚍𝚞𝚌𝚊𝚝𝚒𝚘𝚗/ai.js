import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"],
    description: "Interact with the GPT-4 Mini API",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

const previousResponses = new Map(); // Store previous responses for each user

async function onCall({ message, args }) {
    const id = message.senderID;
    const query = args.length ? args.join(" ") : "hi"; // Default query if none provided
    const header = "🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━";
    const footer = "━━━━━━━━━━━━━━━━";

    // Construct follow-up query if there's a previous response
    if (previousResponses.has(id)) {
        const previousResponse = previousResponses.get(id);
        query = `Follow-up on: "${previousResponse}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);
        const response = await axios.get(`https://www.samirxpikachu.run.place/gpt4mini?prompt=${encodeURIComponent(query)}`);
        typ();

        // Check response validity and send it
        if (response.data?.response) {
            const aiResponse = response.data.response;
            await message.send(`${header}\n${aiResponse}\n${footer}`);
            previousResponses.set(id, aiResponse); // Store latest response
        } else {
            await message.send(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("API call failed: ", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};