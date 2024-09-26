import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {TCommandConfig} */
const config = {
    name: "gmage",
    aliases: ["gimg"],
    description: "Search Images using Google Image Search",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2], // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

/** @type {TOnCallCommand} */
const onCall = async ({ message, args }) => {
    const imgData = [];
    try {
        if (args.length === 0) {
            return message.send('📷 | Follow this format:\n-gmage naruto uzumaki');
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

        // Fill the rest with null values if there are fewer than 9 images
        while (images.length < 9) {
            images.push(null);
        }

        let imagesDownloaded = 0;

        for (const image of images) {
            if (!image) continue; // Skip null values

            const imageUrl = image.link;

            try {
                const imageResponse = await axios.head(imageUrl); // Check if the image URL is valid

                // Validate the image
                if (imageResponse.headers['content-type'].startsWith('image/')) {
                    const response = await axios({
                        method: 'get',
                        url: imageUrl,
                        responseType: 'stream',
                    });

                    const outputFileName = path.join(__dirname, '../cache', `downloaded_image_${imgData.length + 1}.png`);
                    const writer = fs.createWriteStream(outputFileName);

                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    imgData.push(outputFileName); // Store file paths instead of streams
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
            // Send images as attachments
            await message.send({ attachment: imgData });

            // Clean up local copies after sending
            await Promise.all(imgData.map(img => fs.remove(img)));
        } else {
            message.send('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)');
        }
    } catch (error) {
        console.error(error);
        return message.send('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)');
    }
};

// Exporting the config and command handler
export default {
    config,
    onCall,
};