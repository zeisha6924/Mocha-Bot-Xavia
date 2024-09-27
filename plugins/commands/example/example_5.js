const config = {
    name: "example",
    aliases: ["example"],
    description: "This is an example command",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const msgData = await message.send("This is an example message");
    msgData.addReactEvent({ callback: onReaction });
    msgData.addReplyEvent({ callback: onReply });
}

async function onReply({ message }) {
    // Handle reply events
}

async function onReaction({ message }) {
    // Handle reaction events
}

export default {
    config,
    onCall,
};