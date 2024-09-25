import samirapi from 'samirapi';

const config = {
    name: "pinte",
    aliases: ["pinte"],
    description: "Search for images on Pinterest based on a query.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "Aljur Pogoy",
    extra: {
        // Will be saved in config.plugins.json
        searchType: "images",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, balance }) {
    const query = args.join(" ") || "beautiful landscapes";

    try {
        const images = await samirapi.searchPinterest(query);
        console.log("Pinterest Images:", images);

        message
            .send(`Here are some images I found for "${query}":\n${images.join("\n")}`)
            .then((data) => {
                data.addReactEvent({ callback: onReaction });
                data.addReplyEvent({ callback: onReply });
            })
            .catch((e) => {
                console.error(e);
                message.send("Sorry, something went wrong while fetching images.");
            });

    } catch (error) {
        console.error(error);
        message.send("There was an error accessing Pinterest. Please try again later.");
    }
}

/** @type {TReplyCallback} */
async function onReply({ message, balance, getLang, data, xDB, eventData }) {
    // Handle replies to the bot's message
}

/** @type {TReactCallback} */
async function onReaction({ message, balance, getLang, data, xDB, eventData }) {
    // Handle reactions to the bot's message
}

export { config, onCall };