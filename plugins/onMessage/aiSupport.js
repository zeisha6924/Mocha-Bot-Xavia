const cachePath = '../commands/general/ai.js'; // Correct relative path

// Dynamically import the AI command script
let aiCommand;
try {
    aiCommand = await import(cachePath).then(module => module.default);
} catch (error) {
    console.error(`Failed to load AI command script from ${cachePath}:`, error);
    throw error;
}

function onCall({ message, args, getLang, data, userPermissions }) {
    const input = message.body.trim();

    if (input.toLowerCase().startsWith("ai")) {
        // Extract the command and pass it to the AI command script
        const newArgs = input.slice(2).trim().split(" ");
        aiCommand.onCall({
            message,
            args: newArgs,
            getLang,
            data,
            userPermissions,
            prefix: "ai"
        });
    }

    return;
}

export default {
    onCall
};