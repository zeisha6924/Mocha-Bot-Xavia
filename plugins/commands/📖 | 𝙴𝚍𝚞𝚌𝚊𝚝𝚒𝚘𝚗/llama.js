import samirapi from 'samirapi';

const config = {
    name: "llama",
    aliases: ["llama"], // You can add more meaningful aliases if needed
    description: "Query the Llama3 API for information.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    // Combine args into a single query string
    const query = args.join(" ");
    if (!query) {
        return message.send("Please provide a query to search.");
    }

    try {
        const response = await samirapi.llama3(query);
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
