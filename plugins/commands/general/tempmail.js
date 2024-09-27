import samirapi from "samirapi";

const config = {
    name: "tempmail",
    aliases: ["tmpmail", "mail"],
    description: "Generate a temporary email address or check the inbox of a temporary email.",
    usage: "[create/inbox] [email]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

const langData = {
    en: {
        generateUsage: "Use 'gpt tempmail create' to generate a temporary email or 'gpt tempmail inbox [email]' to retrieve inbox messages.",
        generateFail: "❌ | Failed to generate email. Error: ",
        inboxFail: "❌ | Failed to retrieve inbox messages. Error: ",
        invalidCommand: "❌ | Invalid command. Use 'gpt tempmail create' to generate a temporary email or 'gpt tempmail inbox [email]' to retrieve inbox messages.",
        noMessages: "❌ | No messages found in the inbox.",
        generatedEmail: "📩 Generated email: ",
        inboxMessage: "━━━━━━━━━━━━━━━━\n📬 Inbox messages for ",
        inboxDetails: "📧 From: {from}\n📩 Subject: {subject}\n📅 Date: {date}\n━━━━━━━━━━━━━━━━",
    },
};

async function onCall({ message, args, getLang }) {
    try {
        if (args.length === 0) {
            return message.send(getLang("generateUsage"));
        }

        const command = args[0].toLowerCase();

        if (command === "create") {
            try {
                // Generate a random temporary email using samirapi
                const email = await samirapi.getTempMail();
                return message.send(`${getLang("generatedEmail")}${email}`);
            } catch (error) {
                console.error("❌ | Failed to generate email", error.message);
                return message.send(`${getLang("generateFail")}${error.message}`);
            }
        } else if (command === "inbox" && args.length === 2) {
            const email = args[1];
            if (!email) {
                return message.send(getLang("invalidCommand"));
            }

            try {
                // Retrieve messages from the specified email using samirapi
                const inboxMessages = await samirapi.getInbox(email);

                if (!Array.isArray(inboxMessages) || inboxMessages.length === 0) {
                    return message.send(getLang("noMessages"));
                }

                // Get the most recent message
                const latestMessage = inboxMessages[0];
                const { date, from, subject } = latestMessage;

                const formattedMessage = getLang("inboxDetails")
                    .replace("{from}", from)
                    .replace("{subject}", subject)
                    .replace("{date}", date);

                return message.send(`${getLang("inboxMessage")}${email}:\n${formattedMessage}`);
            } catch (error) {
                console.error(`❌ | Failed to retrieve inbox messages`, error.message);
                return message.send(`${getLang("inboxFail")}${error.message}`);
            }
        } else {
            return message.send(getLang("invalidCommand"));
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
        return message.send(`❌ | An unexpected error occurred: ${error.message}`);
    }
}

export default {
    config,
    onCall,
};