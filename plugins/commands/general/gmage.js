import samirapi from 'samirapi';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const config = {
    name: "gmage",
    aliases: ["gimg", "gimage"],
    description: "Search for images on Google based on a query.",
    usage: "[query] -[number of images]",
    cooldown: 5,
    permissions: [1, 2],  // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
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

    try {
        // Fetch images using Google Image Search via samirapi
        const images = await samirapi.googleImageSearch(query);
        console.log(`Google Image Search Results:`, images);

        // Limit the number of images sent to the user
        const finalImages = images.slice(0, imageCount);

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
        await message.reply("There was an error accessing Google Images or downloading the images. Please try again later.");
    }
}

export default {
    config,
    onCall
};