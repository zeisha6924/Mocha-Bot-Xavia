const cachePath = '../commands/general/gpt.js'; // Relative path to gpt.js

let gptCommand;
try {
    gptCommand = await import(cachePath).then(module => module.default);
    console.log('GPT Command loaded successfully'); // Debug log
} catch (error) {
    console.error(`Failed to load GPT command script from ${cachePath}:`, error);
    throw error;
}

function onCall({ message, args, getLang, data, userPermissions }) {
    const input = message.body.trim();

    if (input.toLowerCase().startsWith("gpt")) {
        // Extract the command and pass it to the GPT command script
        const newArgs = input.slice(3).trim().split(" ");
        gptCommand.onCall({
            message,
            args: newArgs,
            getLang,
            data,
            userPermissions,
        });
    }

    return;
}

export default {
    onCall
};