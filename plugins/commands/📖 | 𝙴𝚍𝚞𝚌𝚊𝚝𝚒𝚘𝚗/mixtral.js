import samirapi from 'samirapi';

const config = {
    name: "mixtral",
    aliases: ["mix", "assistant"],
    description: "AI Assistant that answers any questions",
    usage: "[question]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

async function onCall({ message, args }) {
    if (args.length === 0) {
        return message.send("Please provide a question for the AI assistant.");
    }

    const question = args.join(" ");
    try {
        const response = await samirapi.mixtral142B(question, "You are a literature expert");
        await message.send(response);
    } catch (error) {
        console.error(error);
        await message.send("An error occurred while trying to get an answer. Please try again later.");
    }
}

export default {
    config,
    onCall,
};
