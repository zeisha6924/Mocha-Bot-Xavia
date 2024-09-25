const langData = {
    "en_US": {
        "prefix.get": "🌐 System's Current Prefix [ {prefix} ]"
    },
    "vi_VN": {
        "prefix.get": "🌐 System's Current Prefix [ {prefix} ]"
    }
}

function onCall({ message, getLang, data }) {
    if (message.body == "prefix" && message.senderID != global.botID) {
        message.reply(getLang("prefix.get", {
            prefix: data?.thread?.data?.prefix || global.config.PREFIX
        }));
    }

    return;
}

export default {
    langData,
    onCall
}