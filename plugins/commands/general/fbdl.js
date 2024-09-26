import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = './plugins/commands/cache';

const config = {
    name: "fbdl",
    aliases: ["fbdownload", "fbvideo"],
    description: "Download a Facebook video from the provided link.",
    usage: "[video URL]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
};

const langData = {
    lang_1: { message: "Downloading Facebook video, please wait..." },
    lang_2: { message: "Video download in progress..." },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang }) {
    if (!args[0]) {
        return message.send("Please provide a Facebook video URL.");
    }

    const videoUrl = args[0];
    const filePath = path.join(cachePath, 'facebook_video.mp4'); // Define the path for the downloaded video

    try {
        // Notify the user about the processing
        const sendingMessage = getLang("lang_1.message") || "Processing your request...";
        await message.send(sendingMessage);

        // Attempt to download the video
        const data = await samirapi.facebook(videoUrl);

        // Check if the download URL is present
        if (data && data.downloadUrl) {
            // Download the video file
            const videoBuffer = await samirapi.download(data.downloadUrl); // Ensure this function returns a buffer

            // Save the video file to the specified path
            await fs.outputFile(filePath, videoBuffer);

            // Send the video to the user
            await message.send({
                body: "Here is your video:",
                attachment: fs.createReadStream(filePath) // Send the saved video file
            });

            // Cleanup: Delete the file after sending
            await fs.unlink(filePath);
        } else {
            await message.send("Sorry, I couldn't retrieve the video. Please check the URL and ensure it is a valid Facebook video link.");
        }
    } catch (error) {
        console.error("Error downloading video:", error);
        await message.send(`An error occurred while trying to download the video: ${error.message || error}`);
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

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
};