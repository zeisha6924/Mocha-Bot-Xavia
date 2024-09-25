import samirapi from 'samirapi';
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

const cachePath = './plugins/commands/cache';

/** @type {TOnCallCommand} */
async function onCall({ message, args }) {
    const query = args.join(" ") || "beautiful landscapes";
    
    // Prepare to fetch images from both requests
    const allImages = [];

    try {
        // First request
        const images1 = await samirapi.searchPinterest(query);
        console.log("Pinterest Images (1):", images1);
        if (images1.result) {
            allImages.push(...images1.result);
        }

        // Second request with query + 1
        const images2 = await samirapi.searchPinterest(`${query} 1`);
        console.log("Pinterest Images (2):", images2);
        if (images2.result) {
            allImages.push(...images2.result);
        }

        if (allImages.length > 0) {
            const filePaths = [];

            // Download all images
            for (let i = 0; i < allImages.length; i++) {
                const url = allImages[i];
                const filePath = path.join(cachePath, `image${i}.jpg`);
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

                filePaths.push(filePath);
            }

            // Send all images in one message as a direct reply
            await message.reply({
                body: `Here are the top images for "${query}".`,
                attachment: filePaths.map(filePath => fs.createReadStream(filePath))
            });

            // Cleanup: Remove downloaded files
            filePaths.forEach(filePath => fs.unlinkSync(filePath));

        } else {
            await message.reply(`I couldn't find any images for "${query}".`);
        }

    } catch (error) {
        console.error(error);
        await message.reply("There was an error accessing Pinterest or downloading the images. Please try again later.");
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