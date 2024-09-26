const config = {
    name: "tid",
    aliases: ["threadid"],
    version: "1.0.0",
    description: "Returns the thread ID",
    usage: "",
    credits: "Your Name"
};

async function onCall({ message }) {
    // Send the thread ID back as a reply
    message.reply(`Thread ID: ${message.threadID}`);
}

export default {
    config,
    onCall
};