import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

const _48MB = 48 * 1024 * 1024;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = './plugins/commands/cache';

const config = {
    name: "fbdl",
    aliases: ["fbdownload", "fbvideo"],
    description: "Download a Facebook video from the provided link.",
    usage: "[video URL]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "XaviaTeam",
};

const langData = {
    "en_US": {
        "missingUrl": "Please provide a Facebook video URL.",
        "fileTooLarge": "File is too large, max size is 48MB.",
        "error": "An error occurred while downloading the video."
    },
    // Add more languages if needed
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang }) {
    let filePath;
    try {
        if (!args[0]) return message.send(getLang('missingUrl'));

        const videoUrl = args[0];
        message.react("⏳");
        
        // Attempt to fetch the video download data
        const data = await samirapi.facebook(videoUrl);

        // Validate the download URL
        const downloadUrls = data?.downloadUrl;
        if (Array.isArray(downloadUrls) && downloadUrls.length > 0) {
            filePath = path.join(cachePath, 'facebook_video.mp4');

            // Download the video using the first URL in the array
            const videoBuffer = await samirapi.download(downloadUrls[0]);

            // Save the video to the specified path
            await fs.outputFile(filePath, videoBuffer);

            // Check the file size before sending
            const fileStat = statSync(filePath);
            if (fileStat.size > _48MB) {
                await fs.unlink(filePath); // Clean up if file is too large
                return message.send(getLang('fileTooLarge'));
            }

            message.react("✅");
            await message.send({
                body: "Here is your video:",
                attachment: fs.createReadStream(filePath)
            });
        } else {
            return message.send(getLang('error'));
        }
    } catch (error) {
        message.react("❌");
        console.error("Error downloading video:", error);
        await message.send(`${getLang('error')} Details: ${error.message || error}`);
    } finally {
        // Cleanup: Ensure the file is deleted after the process
        try {
            if (filePath && await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
            }
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }
    }
}

/** @type {TReplyCallback} */
async function onReply({ message }) {
    // Handle reply events if needed
}

/** @type {TReactCallback} */
async function onReaction({ message }) {
    // Handle reaction events if needed
}

export default {
    config,
    langData,
    onCall,
};