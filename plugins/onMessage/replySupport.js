import copilot from '../commands/general/copilot.js';

export default function ({ message, event }) {
    const { body, messageID, senderID, attachments, threadID, isReply } = message;

    // Checking if the message is a reply
    if (isReply) {
        const repliedMessage = global.data.messages.find(
            msg => msg.messageID === event.messageReply.messageID
        );

        if (repliedMessage && repliedMessage.body.startsWith('🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝')) {
            // If the replied message starts with the Copilot header, process it as a follow-up
            copilot.onReply({ message });
        }
    }

    // Storing the current message
    global.data.messages.push({
        body,
        messageID,
        attachments,
        threadID
    });
}