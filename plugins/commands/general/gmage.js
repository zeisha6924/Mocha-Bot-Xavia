import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';

const config = {
    name: "gmage",
    aliases: ["gimg", "gimage"],
    description: "Search for images on Google based on a query.",
    usage: "[query] -[number of images]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

const cachePath = './plugins/commands/cache';

async function onStart({ message, event, args }) {
    try {
        if (args.length === 0) {
            return message.send('📷 | Follow this format:\n-gmage naruto uzumaki', event.threadID, event.messageID);
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
        const imgData = [];
        let imagesDownloaded = 0;

        for (const image of images) {
            if (!image) continue;

            const imageUrl = image.link;

            try {
                const imageResponse = await axios.head(imageUrl);

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

                    imgData.push({ path: outputFileName });
                    imagesDownloaded++;
                } else {
                    console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
                }
            } catch (error) {
                console.error(`Error downloading image (${imageUrl}):`, error);
                continue;
            }
        }

        if (imagesDownloaded > 0) {
            const attachments = imgData.map(img => fs.createReadStream(img.path));
            await message.send({ attachment: attachments }, event.threadID, event.messageID);

            // Remove local copies after sending
            for (const img of imgData) {
                fs.removeSync(img.path);
            }
        } else {
            message.send('📷 | Can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
        }
    } catch (error) {
        console.error(error);
        return message.send('📷 | Can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
    }
}

async function onCall({ message, event, args }) {
    await onStart({ message, event, args });
}

export default {
    config,
    onCall,
};