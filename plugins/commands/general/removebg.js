import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = './plugins/commands/cache';

const config = {
    name: "removebg",
    version: "1.0.0",
    permissions: [0, 1, 2],
    credits: "coffee",
    description: "Removes the background from an image.",
    commandCategory: "Images",
    usages: "Reply to an image message to remove its background.",
    cooldown: 5,
};

const langData = {
    en_US: {
        notAReply: "Please reply to an image message to remove its background.",
        notAPhoto: "This is not a photo.",
        processingError: "An error occurred while processing the image.",
        executionError: "An error occurred while executing the command.",
        successMessage: "Here is the image with the background removed ✅"
    }
};

async function onCall({ message, getLang }) {
    const reply = message.messageReply;

    if (!reply?.attachments?.length) {
        return message.reply(getLang("notAReply"));
    }

    if (reply.attachments[0].type !== "photo") {
        return message.reply(getLang("notAPhoto"));
    }

    try {
        const imageUrl = reply.attachments[0].url;
        const imageBuffer = await samirapi.remBackground(imageUrl);
        const filePath = path.join(cachePath, 'no_background.png');

        await fs.outputFile(filePath, imageBuffer);
        await message.reply({
            body: getLang("successMessage"),
            attachment: fs.createReadStream(filePath)
        });

        await fs.unlink(filePath);
    } catch (error) {
        console.error(error);
        return message.reply(getLang("executionError"));
    }
}

export default {
    config,
    onCall
};