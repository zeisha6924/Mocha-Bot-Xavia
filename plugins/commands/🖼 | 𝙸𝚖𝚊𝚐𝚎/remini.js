import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cachePath = './plugins/commands/cache';

const config = {
    name: 'remini',
    version: '1.0.0',
    permissions: 0,
    credits: 'Cache',
    description: 'Enhance the image',
    commandCategory: 'Images',
    usages: 'Reply to the image',
    category: "𝙸𝚖𝚊𝚐𝚎",
    cooldown: 5,
    dependencies: {}
};

const langData = {
    "en_US": {
        "notAReply": "Please reply to the image to enhance it.",
        "notAPhoto": "This is not a photo.",
        "processingError": "An error occurred while processing the image.",
        "executionError": "An error occurred while executing the command.",
        "successMessage": "The image has been successfully enhanced ✅"
    }
};

async function onCall({ message, getLang }) {
    if (!message.messageReply || !message.messageReply.attachments || message.messageReply.attachments.length === 0) {
        return message.reply(getLang("notAReply"));
    }

    if (message.messageReply.attachments[0].type !== "photo") {
        return message.reply(getLang("notAPhoto"));
    }

    try {
        const imageUrl = message.messageReply.attachments[0].url;

        // Fetch the enhanced image from the API
        const response = await axios.get('https://4k-ayoub.vercel.app/upscale?url=' + encodeURIComponent(imageUrl), { responseType: 'arraybuffer' });

        if (response.status !== 200) {
            return message.reply(getLang("processingError"));
        }

        const imgBuffer = Buffer.from(response.data, 'binary');

        // Ensure the cache directory exists
        await fs.ensureDir(cachePath);

        // Save the image to the cache directory
        const filePath = path.join(cachePath, `4k.png`);
        await fs.outputFile(filePath, imgBuffer);

        // Send the enhanced image as a reply
        await message.reply({
            body: getLang("successMessage"),
            attachment: fs.createReadStream(filePath)
        });
    } catch (error) {
        console.error(error);
        return message.reply(getLang("executionError"));
    }
}

export default {
    config,
    langData,
    onCall
};