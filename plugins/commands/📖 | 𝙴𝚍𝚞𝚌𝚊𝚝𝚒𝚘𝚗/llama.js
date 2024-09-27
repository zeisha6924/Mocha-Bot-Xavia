import samirapi from 'samirapi';

const config = {
    name: "llama",
    aliases: ["llama3"],
    description: "Query the Llama3 API with a system prompt.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ");
    if (!query) {
        return message.send("Please provide a query to search.");
    }

    // Define a system prompt to guide the AI's response
    const system_prompt = "You are a helpful assistant. Provide detailed information.";

    try {
        // Call the llama3 function with the prompt and system prompt
        const response = await samirapi.llama3(query, system_prompt);
        await message.send(response);
    } catch (error) {
        console.error(error);
        await message.send("An error occurred while fetching data from Llama3. Please try again later.");
    }
}

export default {
    config,
    onCall,
};