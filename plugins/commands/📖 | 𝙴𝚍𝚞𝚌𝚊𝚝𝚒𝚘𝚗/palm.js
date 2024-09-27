import samirapi from 'samirapi';

const config = {
    name: "palm",
    aliases: ["palm"],
    description: "Ask a question using the Palm API",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

async function onCall({ message, args }) {
    const query = args.join(" ");

    if (!query) {
        return message.send("Please provide a question to ask.");
    }

    let responseMessage;
    try {
        // Call the Palm API with the user's query
        const response = await samirapi.palm(query);
        responseMessage = response;
    } catch (error) {
        responseMessage = "An error occurred while processing your request.";
        console.error(error);
    }

    // Send the API's response to the user
    const msgData = await message.send(responseMessage);

    // Optionally handle reactions or replies
    msgData.addReactEvent({ callback: onReaction });
    msgData.addReplyEvent({ callback: onReply });
}

async function onReply({ message }) {
    // Handle reply events, e.g., follow-up questions
    // You could continue the conversation or provide additional info here
}

async function onReaction({ message }) {
    // Handle reaction events, e.g., logging reactions or triggering other actions
}

export default {
    config,
    onCall,
};
