const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Interacts with the Gemini AI model.",
    usage: "[query] [imageURL]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;
    const threadId = message.threadID;
    const replyMessage = message.messageReply;

    const query = args.length ? args.join(" ") : "hi";

    let imageUrl = '';
    if (replyMessage && replyMessage.attachments && replyMessage.attachments.length > 0) {
        const attachment = replyMessage.attachments[0];
        if (attachment.type === 'photo') {
            imageUrl = attachment.url;
        }
    }

    try {
        await message.react("🕰️");
        const typ = global.api.sendTypingIndicator(threadId);

        const apiUrl = `https://www.samirxpikachu.run.place/gemini?text=${encodeURIComponent(query)}&system=default&url=${encodeURIComponent(imageUrl || '')}&uid=${userId}`;
        const response = await fetch(apiUrl).then(res => res.text());

        typ();

        const header = "👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n";
        const footer = "\n━━━━━━━━━━━━━━━━";

        if (response && typeof response === 'string') {
            await message.send(`${header}${response}${footer}`);
            await message.react("✅");
        } else {
            await message.send(`${header}Error: Unexpected response format from API.${footer}`);
            await message.react("❎");
        }
    } catch (error) {
        console.error("API call failed: ", error);
        const header = "👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n";
        const footer = "\n━━━━━━━━━━━━━━━━";
        await message.send(`${header}Error: Unexpected response format from API.${footer}`);
        await message.react("❎");
    }
}

export default {
    config,
    onCall,
};