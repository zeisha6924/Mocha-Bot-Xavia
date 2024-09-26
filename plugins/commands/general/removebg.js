import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = './plugins/commands/cache';

const config = {
    name: "removebg",
    version: "1.0.0",
    permissions: [1, 2], // Updated permissions
    credits: "XaviaTeam",
    description: "Removes the background from an image.",
    commandCategory: "Images",
    usages: "Reply to an image message to remove its background.",
    cooldown: 5,
};

const langData = {
    "en_US": {
        "notAReply": "Please reply to an image message to remove its background.",
        "notAPhoto": "This is not a photo.",
        "processingError": "An error occurred while processing the image.",
        "executionError": "An error occurred while executing the command.",
        "successMessage": "Here is the image with the background removed ✅"
    }
};

async function onCall({ message, getLang }) {
    // Check if the message is a reply and contains an image
    if (!message.messageReply || !message.messageReply.attachments || message.messageReply.attachments.length === 0) {
        return message.reply(getLang("notAReply"));
    }

    // Check if the replied message contains a photo
    if (message.messageReply.attachments[0].type !== "photo") {
        return message.reply(getLang("notAPhoto"));
    }

    try {
        const imageUrl = message.messageReply.attachments[0].url;

        // Remove the background from the image
        const imageBuffer = await samirapi.remBackground(imageUrl);
        
        // Ensure the cache directory exists
        await fs.ensureDir(cachePath);

        // Save the image to the cache directory
        const filePath = path.join(cachePath, 'no_background.png');
        await fs.outputFile(filePath, imageBuffer);

        // Send the processed image as a reply
        await message.reply({
            body: getLang("successMessage"),
            attachment: fs.createReadStream(filePath)
        });

        // Optionally clean up the saved image after sending
        await fs.unlink(filePath); // Delete the saved image after sending
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