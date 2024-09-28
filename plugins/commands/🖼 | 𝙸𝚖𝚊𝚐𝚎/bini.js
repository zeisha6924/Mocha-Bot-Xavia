import fs from 'fs';
import path from 'path';
import axios from 'axios';

const config = {
    name: "bini",
    aliases: ["bini"],
    description: "Fetch a random video/photo from BINI API and download it",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

// Set the path for saving downloads
const cachePath = './plugins/commands/cache';

async function onCall({ message }) {
    try {
        // Fetch data from the BINI API
        const response = await axios.get("https://bini-api.vercel.app/1");
        const data = response.data;

        // Check if the API call was successful
        if (data.success) {
            const { title, username, displayname, link } = data;
            const filePath = path.join(cachePath, `${username}.mp4`);

            // Download the video
            const writer = fs.createWriteStream(filePath);
            const videoResponse = await axios({
                url: link,
                method: 'GET',
                responseType: 'stream',
            });

            videoResponse.data.pipe(writer);

            writer.on('finish', async () => {
                writer.close();
                const msg = `**Title:** ${title}\n**Posted by:** ${displayname} (@${username})`;
                await message.send(msg, {
                    attachment: filePath,
                    threadID: message.threadID, // Include the ThreadID here
                });
            });

            writer.on('error', async () => {
                await message.send("Failed to download the video/photo.");
            });
        } else {
            await message.send("Failed to fetch data from BINI API.");
        }
    } catch {
        await message.send("An error occurred while fetching data.");
    }
}

export default {
    config,
    onCall,
};