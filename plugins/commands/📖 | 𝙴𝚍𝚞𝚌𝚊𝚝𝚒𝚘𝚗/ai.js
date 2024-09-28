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
const apiEndpoints = [
    "https://samirxpikachuio.onrender.com/gpt4mini?prompt=",
    "https://www.samirxpikachu.run.place/gpt4mini?prompt=",
    "http://samirxzy.onrender.com/gpt4mini?prompt="
];

async function fetchResponse(query) {
    for (const endpoint of apiEndpoints) {
        try {
            const response = await axios.get(`${endpoint}${encodeURIComponent(query)}`);
            if (response.data?.response) {
                return response.data.response; // Return response if valid
            }
        } catch (error) {
            console.error(`API call failed at ${endpoint}: `, error);
        }
    }
    throw new Error("All APIs failed to respond."); // Throw an error if all fail
}

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
        const aiResponse = await fetchResponse(query); // Fetch response from APIs
        typ();

        await message.send(`${header}\n${aiResponse}\n${footer}`);
        previousResponses.set(id, aiResponse); // Store latest response
    } catch (error) {
        console.error("Failed to fetch AI response: ", error);
        await message.send(`${header}\nAn error occurred while trying to reach the APIs.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};