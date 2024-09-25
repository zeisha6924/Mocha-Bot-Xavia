import samirapi from 'samirapi';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const cachePath = './plugins/commands/cache';

const config = {
    name: "removebg",
    aliases: ["rbg"],
    description: "Removes the background from an image.",
    usage: "Reply to an image message to remove its background.",
    cooldown: 5,
    permissions: [1, 2], // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
    extra: {
        // additional properties if needed
    },
};

/** @type {TReplyCallback} */
async function onReply({ message, balance, getLang, data, xDB, eventData }) {
    // Check if the replied message has an image
    const repliedMessage = eventData.message;
    if (!repliedMessage || !repliedMessage.attachments || repliedMessage.attachments.length === 0) {
        return message.send("Please reply to an image message.");
    }

    const imageUrl = repliedMessage.attachments[0].url; // Assuming the URL is stored in this format

    try {
        const imageBuffer = await samirapi.remBackground(imageUrl);
        const outputPath = join(cachePath, 'no_background.png'); // Use the specified cache path
        writeFileSync(outputPath, imageBuffer);
        
        // Send the processed image back to the original message
        await message.send("Here is the image with the background removed:", { 
            files: [outputPath] 
        });

        // Clean up the saved image
        unlinkSync(outputPath); // Delete the saved image after sending
    } catch (error) {
        console.error(error);
        message.send("An error occurred while processing the image.");
    }
}

/** @type {TOnCallCommand} */
async function onCall({ message }) {
    message.send("Please reply to an image message to remove its background.");
}

export { config, onCall, onReply };