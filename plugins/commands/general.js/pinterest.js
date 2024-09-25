import samirapi from 'samirapi';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const config = {
    name: "pinterest",
    aliases: ["pin"],
    description: "Search for images on Pinterest based on a query.",
    usage: "[query] -[number of images]",
    cooldown: 5,
    permissions: [0, 1, 2],
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
    let imageCount = 1; // Default to 1 image
    const query = args.slice(0, -1).join(" ") || "beautiful landscapes";

    // Extract the number of images if provided
    const countArg = args[args.length - 1];
    if (countArg.startsWith('-')) {
        imageCount = parseInt(countArg.slice(1), 10);
        if (isNaN(imageCount) || imageCount < 1) {
            imageCount = 1;  // Default to 1 if invalid
        } else if (imageCount > 12) {
            imageCount = 12; // Cap at 12
        }
    }

    // Prepare to fetch images
    const allImages = [];
    let fetchedImagesCount = 0;

    try {
        // Fetch images in increments of 6 (two requests max)
        while (fetchedImagesCount < imageCount) {
            const remaining = imageCount - fetchedImagesCount;
            const fetchLimit = Math.min(6, remaining); // Only fetch up to 6 at a time

            // First request
            const images1 = await samirapi.searchPinterest(query);
            console.log(`Pinterest Images (${fetchedImagesCount + 1}-${fetchedImagesCount + images1.result.length}):`, images1);
            if (images1.result) {
                allImages.push(...images1.result.slice(0, fetchLimit));
                fetchedImagesCount += images1.result.length;
            }

            if (fetchedImagesCount < imageCount) {
                // Second request with query + 1
                const images2 = await samirapi.searchPinterest(`${query} 1`);
                console.log(`Pinterest Images (${fetchedImagesCount + 1}-${fetchedImagesCount + images2.result.length}):`, images2);
                if (images2.result) {
                    allImages.push(...images2.result.slice(0, fetchLimit));
                    fetchedImagesCount += images2.result.length;
                }
            }

            // Break if no more images found
            if (fetchedImagesCount >= imageCount) break;
        }

        // Limit the number of images sent to the user
        const finalImages = allImages.slice(0, imageCount);

        if (finalImages.length > 0) {
            const filePaths = [];

            // Download all images
            for (let i = 0; i < finalImages.length; i++) {
                const url = finalImages[i];
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
                body: `Here are the top ${finalImages.length} images for "${query}".`,
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
