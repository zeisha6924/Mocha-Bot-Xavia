const config = {
    name: "unsend",
    aliases: ["unsend"],
    description: "Unsend bot's message",
    usage: "[reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "dataNotReady": "The group's data is not ready",
        "notReply": "You must reply to the bot's message",
        "notBotMessage": "The message you replied to is not from the bot",
        "notAllowed": "This group is not allowed to unsend the bot's message",
        "error": "An error has occurred"
    }
}

async function onCall({ message, args, getLang, data, userPermissions }) {
    try {
        // Check if the message is a reply to the bot's message
        if (message.type !== "message_reply") return message.reply(getLang("notReply"));
        if (message.messageReply?.senderID !== global.botID) return message.reply(getLang("notBotMessage"));

        const targetMessageID = message.messageReply.messageID;

        // Attempt to unsend the message
        global.api.unsendMessage(targetMessageID, (error) => {
            if (error) {
                console.error("Error unsending message:", error);
                message.react("❌");
            } else {
                message.react("✅");
            }
        });
    } catch (err) {
        console.error("Unhandled error:", err);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}