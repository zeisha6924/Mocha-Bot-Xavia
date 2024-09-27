import samirapi from "samirapi";

const config = {
    name: "tempmail",
    aliases: ["tmpmail", "mail"],
    description: "Generate a temporary email address or check the inbox of a temporary email.",
    usage: "[create/inbox] [email]",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 5,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

async function onCall({ message, args }) {
    try {
        if (args.length === 0) {
            return message.send(
                "Use '-tempmail create' to generate a temporary email or '-tempmail inbox [email]' to retrieve inbox messages."
            );
        }

        const command = args[0].toLowerCase();

        if (command === "create") {
            try {
                // Generate a random temporary email using samirapi
                const { email } = await samirapi.getTempMail();
                if (!email) {
                    throw new Error("Email not generated.");
                }
                return message.send(`━━━━━━━━━━━━━━━━\n📩 Email:${email}\n━━━━━━━━━━━━━━━━`);
            } catch (error) {
                console.error("❌ | Failed to generate email", error.message);
                return message.send(`❌ | Failed to generate email. Error: ${error.message}`);
            }
        } else if (command === "inbox" && args.length === 2) {
            const email = args[1];
            if (!email) {
                return message.send(
                    "❌ | Invalid command. Use '-tempmail create' to generate a temporary email or '-tempmail inbox [email]' to retrieve inbox messages."
                );
            }

            try {
                // Retrieve messages from the specified email using samirapi
                const inboxMessages = await samirapi.getInbox(email);

                if (!Array.isArray(inboxMessages) || inboxMessages.length === 0) {
                    return message.send("❌ | No messages found in the inbox.");
                }

                // Get the most recent message
                const latestMessage = inboxMessages[0];
                const { date, from, subject } = latestMessage;

                const formattedMessage = `📧 From: ${from}\n📩 Subject: ${subject}\n📅 Date: ${date}\n━━━━━━━━━━━━━━━━`;

                return message.send(`━━━━━━━━━━━━━━━━\n📬 Inbox messages for ${email}:\n${formattedMessage}`);
            } catch (error) {
                console.error(`❌ | Failed to retrieve inbox messages`, error.message);
                return message.send(`❌ | Failed to retrieve inbox messages. Error: ${error.message}`);
            }
        } else {
            return message.send(
                "❌ | Invalid command. Use '-tempmail create' to generate a temporary email or '-tempmail inbox [email]' to retrieve inbox messages."
            );
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