import axios from 'axios';

const config = {
    name: "gpt",
    aliases: ["chatgpt"],
    description: "Ask a question to the GPT.",
    usage: "[query]",
    category: "Education",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

async function onCall({ message, args }) {
    if (!args.length) {
        message.reply("🗨️✨ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
        return;
    }

    let query = args.join(" ");
    const uid = message.senderID; // Using senderID as uid

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the new API with the query
        const response = await axios.get(`https://deku-rest-api.gleeze.com/gpt4?prompt=${encodeURIComponent(query)}&uid=${uid}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Extract the reply from the response
        if (response.data && response.data.gpt4) {
            const gptResponse = response.data.gpt4;
            await message.send(`🗨️✨ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n━━━━━━━━━━━━━━━━\n${gptResponse}\n━━━━━━━━━━━━━━━━`);
        } else {
            await message.send("🗨️✨ | 𝙲𝚊𝚝𝙶𝙿𝚃\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        message.react(`❎`);
    }
}

export default {
    config,
    onCall
};