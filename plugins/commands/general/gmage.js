import samirapi from 'samirapi';

const config = {
    name: "gmage",
    aliases: ["googleimage"],
    description: "Search for images on Google.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2], // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
    extra: {
        extraProp: "This is an extra property",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const query = args.join(" "); // Join arguments to form the search query

    if (!query) {
        return message.send(getLang("usage", { prefix, command: config.name }));
    }

    try {
        const images = await samirapi.googleImageSearch(query);
        
        // Check if images were returned
        if (images.length === 0) {
            return message.send(getLang("noImagesFound"));
        }

        // Format the image URLs into a message
        const imageUrls = images.map(img => `![Image](${img.url})`).join('\n'); // Use markdown syntax for images

        // Send the formatted message
        await message.send(`Here are the images I found:\n${imageUrls}`);
    } catch (error) {
        console.error("Error during Google Image Search:", error);
        message.send(getLang("searchError")); // Send a friendly error message to the user
    }
}

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
};