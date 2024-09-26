import fs from "fs";
import path from "path";

const config = {
    name: "file",
    aliases: ["script"],
    description: "Retrieve the content of a specified script file.",
    usage: "[cmd file name]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang }) {
    // Ensure the message object has senderID
    if (!message || !message.senderID) {
        return console.error("Message object is missing or improperly structured.");
    }

    // Check if the user has permission
    if (!["100005954550355"].includes(message.senderID)) {
        return message.send(
            getLang("You don't have enough permission to use this command. Only Coffee can do it.")
        );
    }

    const name = args.join(" ");
    if (!name) {
        return message.send(getLang("Please provide the file name."));
    }

    try {
        const filePath = path.join(__dirname, `../commands/general/${name}.js`);
        const fileContent = fs.readFileSync(filePath, "utf8");
        message.send(fileContent);
    } catch (error) {
        message.send(getLang("File not found!"));
    }
}

// Exporting the config and command handler
export default {
    config,
    onCall,
};