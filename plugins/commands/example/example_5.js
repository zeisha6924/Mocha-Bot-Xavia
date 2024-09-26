const config = {
    name: "example",
    aliases: ["ex"],
    description: "This is an example command",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
    extra: {
        extraProp: "This is an extra property",
    },
};

const langData = {
    lang_1: { message: "This is an example message" },
    lang_2: { message: "This is an example message" },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    const { balance } = message; // Assuming balance is part of message context
    balance.add(2000); // Example balance operation

    // Send a message and handle reactions/replies
    const msgData = await message.send(getLang("message"));
    msgData.addReactEvent({ callback: onReaction });
    msgData.addReplyEvent({ callback: onReply });
}

/** @type {TReplyCallback} */
async function onReply({ message, balance, getLang, data }) {
    // Handle reply events
}

/** @type {TReactCallback} */
async function onReaction({ message, balance, getLang, data }) {
    // Handle reaction events
}

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
};