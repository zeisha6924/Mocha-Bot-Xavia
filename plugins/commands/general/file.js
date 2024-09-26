import fs from "fs";
import path from "path";

const config = {
    name: "file",
    aliases: ["script"],
    description: "Retrieve the content of a specified script file.",
    usage: "[cmd file name]",
    cooldown: 5,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "Coffee",
};

/** @type {TOnCallCommand} */
async function onCall({ api, event, args }) {
    // Check if the user has permission
    if (!["100005954550355"].includes(event.senderID)) {
        return api.sendMessage(
            "You don't have enough permission to use this command. Only Coffee can do it.",
            event.threadID,
            event.messageID
        );
    }

    const name = args.join(" ");
    if (!name) {
        return api.sendMessage("Please provide the file name.", event.threadID);
    }

    try {
        const filePath = path.join(__dirname, `../commands/general/${name}.js`);
        const fileContent = fs.readFileSync(filePath, "utf8");
        api.sendMessage(fileContent, event.threadID);
    } catch (error) {
        api.sendMessage("File not found!", event.threadID);
    }
}

// Exporting the config and command handler
export default {
    config,
    onCall,
};