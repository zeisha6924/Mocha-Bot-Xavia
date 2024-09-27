import axios from "axios";

const EMAIL_API_URL = "https://www.samirxpikachu.run.place/tempmail/get";
const INBOX_API_URL = "https://www.samirxpikachu.run.place/tempmail/inbox/";

const config = {
    name: "tempmail",
    aliases: ["tmpmail", "mail"],
    description: "Generate temporary emails or check the inbox of a temporary email.",
    usage: "[create/inbox] [email]",
    cooldown: 5,
    permissions: [0, 1, 2],
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

async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    try {
        if (args.length === 0) {
            return message.send(getLang("generateUsage"));
        }

        const command = args[0].toLowerCase();

        if (command === "create") {
            let email;
            try {
                // Generate a random temporary email
                const response = await axios.get(EMAIL_API_URL);
                email = response.data.email;

                if (!email) {
                    throw new Error("Failed to generate email");
                }
            } catch (error) {
                console.error("❌ | Failed to generate email", error.message);
                return message.send(`${getLang("generateFail")}${error.message}`);
            }
            return message.send(`${getLang("generatedEmail")}${email}`);
        } else if (command === "inbox" && args.length === 2) {
            const email = args[1];
            if (!email) {
                return message.send(getLang("invalidCommand"));
            }

            let inboxMessages;
            try {
                // Retrieve messages from the specified email
                const inboxResponse = await axios.get(`${INBOX_API_URL}${email}`);
                inboxMessages = inboxResponse.data;

                if (!Array.isArray(inboxMessages)) {
                    throw new Error("Unexpected response format");
                }
            } catch (error) {
                console.error(`❌ | Failed to retrieve inbox messages`, error.message);
                return message.send(`${getLang("inboxFail")}${error.message}`);
            }

            if (inboxMessages.length === 0) {
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