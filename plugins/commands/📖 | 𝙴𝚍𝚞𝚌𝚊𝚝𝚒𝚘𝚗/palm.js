import samirapi from 'samirapi';

const config = {
    name: "palm",
    aliases: ["palm"],
    description: "Send a request to the PaLM AI model.",
    usage: "[text]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    // Join the arguments to form the text to be sent to the PaLM AI model
    const text = args.join(" ");
    
    if (!text) {
        return message.send("Please provide a text input for the PaLM AI model.");
    }

    try {
        // Send a request to the PaLM AI model with the provided text
        const response = await samirapi.palm(text);
        message.send(response); // Send the response back to the chat
    } catch (error) {
        console.error(error);
        message.send("An error occurred while processing your request.");
    }
}

export default {
    config,
    onCall,
};
