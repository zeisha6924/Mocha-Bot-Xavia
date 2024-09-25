import samirapi from 'samirapi';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const config = {
    name: "pinte",
    aliases: ["pinte"],
    description: "Search for images on Pinterest based on a query.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
    extra: {
        searchType: "images",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args }) {
    const query = args.join(" ") || "beautiful landscapes";

    try {
        const images = await samirapi.searchPinterest(query);
        console.log("Pinterest Images:", images);

        if (images.result.length > 0) {
            for (let i = 0; i < images.result.length; i++) {
                const url = images.result[i];
                const filePath = path.resolve(__dirname, `image${i}.jpg`);
                const writer = fs.createWriteStream(filePath);

                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream',
                });

                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Send the image to the user
                await message.send({
                    body: `Image ${i + 1} for "${query}"`,
                    attachment: fs.createReadStream(filePath)
                });

                // Cleanup: Remove downloaded file
                fs.unlinkSync(filePath);
            }

        } else {
            await message.send(`No images found for "${query}".`);
        }

    } catch (error) {
        console.error(error);
        await message.send("There was an error accessing Pinterest or downloading the images. Please try again later.");
    }
}

/** @type {TReplyCallback} */
async function onReply({ message }) {
    // Handle replies to the bot's message
}

/** @type {TReactCallback} */
async function onReaction({ message }) {
    // Handle reactions to the bot's message
}

export { config, onCall };