import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';

/** @type {TCommandConfig} */
const config = {
    name: "gmage",
    aliases: ["gimg"],
    description: "Search Images using Google Image Search",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {TOnCallCommand} */
const onCall = async ({ message, args }) => {
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
        const imgData = []; // To store valid image URLs

        for (const image of images) {
            const imageUrl = image.link;
            console.log(`Image URL: ${imageUrl}`); // Log the image URL to the console

            try {
                const imageResponse = await axios.head(imageUrl); // Check if the image URL is valid

                // Validate the image
                if (imageResponse.headers['content-type'].startsWith('image/')) {
                    imgData.push(imageUrl); // Store valid image URLs
                } else {
                    console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
                }
            } catch (error) {
                console.error(`Error validating image (${imageUrl}):`, error);
                continue; // Skip the current image if there's an error
            }
        }

        if (imgData.length > 0) {
            // Send images as attachments
            await message.send({ attachment: imgData });
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