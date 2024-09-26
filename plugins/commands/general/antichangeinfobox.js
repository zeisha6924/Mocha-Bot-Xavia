import axios from 'axios';

const DEFAULTS = {
    avatar: "https://scontent-sin6-4.xx.fbcdn.net/v/t1.15752-9/453385238_898368142210556_3530930341630206152_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=kJHxf2FdGusQ7kNvgGHnlBz&_nc_ht=scontent-sin6-4.xx&oh=03_Q7cD1QEaETOd-ELmW2_OcezHWUqU2EtUaZ1W7V6Lgxwg9YZAhA&oe=66D7117C",
    emoji: "🧋",
    theme: "195296273246380",
    threadNames: {
        "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
        "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
        "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
        "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
        "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨"
    }
};

async function getStreamFromURL(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    return response.data;
}

export const config = {
    name: "antichangeinfobox",
    aliases: ["aci", "infoboxmonitor"],
    description: "Monitors thread property changes, saves initial settings, detects unauthorized changes, warns users, kicks offenders, and reverts changes.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
    extra: {
        defaultAvatar: DEFAULTS.avatar,
        defaultTheme: DEFAULTS.theme,
        threadNames: DEFAULTS.threadNames
    }
};

/** @type {TOnCallCommand} */
export async function onCall({ message, balance, api, event, threadsData, role }) {
    const { threadID, logMessageType, logMessageData, author } = event;

    const revertChanges = async (property, newValue) => {
        switch (property) {
            case "avatar":
                await api.changeGroupImage(await getStreamFromURL(newValue), threadID);
                break;
            case "name":
                await api.setTitle(newValue, threadID);
                break;
            case "theme":
                await api.changeThreadColor(newValue || DEFAULTS.theme, threadID);
                break;
            case "emoji":
                await api.changeThreadEmoji(newValue, threadID);
                break;
        }
    };

    try {
        switch (logMessageType) {
            case "log:thread-image":
                if (role < 1 && api.getCurrentUserID() !== author) {
                    api.sendMessage("Unauthorized change detected in thread avatar. The bot will remove the user from the group.", threadID);
                    await kickUser(api, author, threadID);
                    await revertChanges("avatar", DEFAULTS.avatar);
                }
                break;

            case "log:thread-name":
                if (DEFAULTS.threadNames[threadID]) {
                    if (role < 1 && api.getCurrentUserID() !== author) {
                        api.sendMessage("Unauthorized change detected in thread name. The bot will remove the user from the group.", threadID);
                        await kickUser(api, author, threadID);
                        await revertChanges("name", DEFAULTS.threadNames[threadID]);
                    }
                }
                break;

            case "log:thread-color":
                if (role < 1 && api.getCurrentUserID() !== author) {
                    api.sendMessage("Unauthorized change detected in thread theme. The bot will remove the user from the group.", threadID);
                    await kickUser(api, author, threadID);
                    await revertChanges("theme", DEFAULTS.theme);
                }
                break;

            case "log:thread-icon":
                if (role < 1 && api.getCurrentUserID() !== author) {
                    api.sendMessage("Unauthorized change detected in thread emoji. The bot will remove the user from the group.", threadID);
                    await kickUser(api, author, threadID);
                    await revertChanges("emoji", DEFAULTS.emoji);
                }
                break;
        }
    } catch (error) {
        console.error("Error in onEvent:", error);
    }
}