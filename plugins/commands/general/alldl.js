import axios from 'axios';
import fs from 'fs';
import path from 'path';
import samirapi from 'samirapi';

const cachePath = './plugins/commands/cache';

const config = {
    name: "alldl",
    aliases: ["download"],
    description: "Download content by link",
    usage: "[link]",
    cooldown: 5,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
};

const langData = {
    "en": {
        "noLink": "Please provide a link.",
        "processing": "Processing your request... Please wait.",
        "unsupported": "Unsupported source.",
        "downloadFailed": "Sorry, the content could not be downloaded.",
        "downloadSuccess": "Content downloaded successfully!",
    }
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang }) {
    const link = args.join(" ");
    if (!link) {
        return message.reply(getLang("noLink"));
    }

    let fetchFunction;

    if (link.includes("facebook.com")) {
        fetchFunction = () => samirapi.facebook(link);
    } else if (link.includes("twitter.com")) {
        fetchFunction = () => samirapi.twitter(link);
    } else if (link.includes("tiktok.com")) {
        fetchFunction = () => samirapi.tiktok(link);
    } else if (link.includes("open.spotify.com")) {
        fetchFunction = () => samirapi.spotifydl(link);
    } else if (link.includes("instagram.com")) {
        fetchFunction = () => samirapi.instagram(link);
    } else {
        return message.reply(getLang("unsupported"));
    }

    message.reply(getLang("processing"));

    try {
        const res = await fetchFunction();
        let contentUrl;

        if (link.includes("facebook.com")) {
            contentUrl = res.links["Download High Quality"];
        } else if (link.includes("twitter.com")) {
            contentUrl = res.HD;
        } else if (link.includes("tiktok.com")) {
            contentUrl = res.hdplay;
        } else if (link.includes("instagram.com")) {
            const instagramResponse = res;
            if (Array.isArray(instagramResponse.url) && instagramResponse.url.length > 0) {
                const mp4UrlObject = instagramResponse.url.find(obj => obj.type === 'mp4');
                if (mp4UrlObject) {
                    contentUrl = mp4UrlObject.url;
                }
            }
        } else if (link.includes("open.spotify.com")) {
            contentUrl = res.link; // Assuming the response has a "link" field for Spotify
        }

        if (!contentUrl) {
            throw new Error("No valid content URL found.");
        }

        // Download the file
        const fileName = path.basename(contentUrl);
        const filePath = path.join(cachePath, fileName);
        
        // Ensure cache directory exists
        if (!fs.existsSync(cachePath)) {
            fs.mkdirSync(cachePath, { recursive: true });
        }

        const response = await axios({
            method: 'get',
            url: contentUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await message.reply({ attachment: fs.createReadStream(filePath) });
            fs.unlinkSync(filePath); // Cleanup the file after sending
        });

        writer.on('error', () => {
            throw new Error("Failed to write file.");
        });

    } catch (error) {
        console.error(error);
        message.reply(getLang("downloadFailed"));
    }
}

export default {
    config,
    langData,
    onCall,
};