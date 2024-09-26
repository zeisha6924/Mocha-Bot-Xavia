import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';

const config = {
    name: "gmage",
    aliases: ["gimg", "gimage"],
    description: "Search for images on Google based on a query.",
    usage: "[query] -[number of images]",
    cooldown: 5,
    permissions: [1, 2], // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

const cachePath = './plugins/commands/cache';

async function onStart({ api, event, args }) {
    try {
        if (args.length === 0) {
            return api.sendMessage('📷 | Follow this format:\n-gmage naruto uzumaki', event.threadID, event.messageID);
        }

        const searchQuery = args.join(' ');
        const apiKey = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
        const searchEngineID = 'e01c6428089ea4702';

        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: apiKey,
                cx: searchEngineID,
                q: searchQuery,
                searchType: 'image',
            },
        });

        const images = response.data.items.slice(0, 9); // Limit to the first 9 images

        // Fill with nulls if fewer than 9 images
        while (images.length < 9) {
            images.push(null);
        }

        const imgData = [];
        let imagesDownloaded = 0;

        for (const image of images) {
            if (!image) {
                continue; // Skip null values
            }

            const imageUrl = image.link;

            try {
                const imageResponse = await axios.head(imageUrl); // Validate image URL

                if (imageResponse.headers['content-type'].startsWith('image/')) {
                    const response = await axios({
                        method: 'get',
                        url: imageUrl,
                        responseType: 'stream',
                    });

                    const outputFileName = path.join(cachePath, `downloaded_image_${imgData.length + 1}.png`);
                    const writer = fs.createWriteStream(outputFileName);

                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    imgData.push(fs.createReadStream(outputFileName));
                    imagesDownloaded++;
                } else {
                    console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
                }
            } catch (error) {
                console.error(`Error downloading image (${imageUrl}):`, error);
                continue; // Skip the current image if there's an error
            }
        }

        if (imagesDownloaded > 0) {
            // Send only non-bad images as attachments
            await api.sendMessage({ attachment: imgData }, event.threadID, event.messageID);

            // Remove local copies after sending
            imgData.forEach((img) => fs.remove(img.path));
        } else {
            api.sendMessage('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
        }
    } catch (error) {
        console.error(error);
        return api.sendMessage('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
    }
}

// Exporting the config and command handler as specified
export default {
    config,
    onStart,
};