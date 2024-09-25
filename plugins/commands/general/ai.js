import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["chat", "mocha"],
    description: "Interact with GPT-4 via API",
    usage: "[query]",
    cooldown: 3,
    permissions: [0], // General users can access
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
};

const langData = {
    "lang_1": {
        "message": "Please provide a prompt to interact with the AI.",
    },
    "lang_2": {
        "message": "Kailangan mo magbigay ng prompt para makipag-ugnayan sa AI.",
    }
};

const header = "🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━\n";
const footer = "\n━━━━━━━━━━━━━━━━";

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args, getLang, data, userPermissions, prefix }) {
    const userId = data.user?.id || 100; // User ID from data or default to 100
    let input = args.join(" "); // Combine arguments into a single prompt

    // Check if the input starts with "ai" and remove it
    if (input.toLowerCase().startsWith("ai")) {
        input = input.slice(2).trim(); // Remove "ai" and any extra spaces
    }

    // If no arguments (prompt) are provided, use a default prompt
    if (input.length === 0) {
        input = "hello";
    }

    const previousResponse = previousResponses.get(userId);

    if (previousResponse && previousResponse.startsWith(header)) {
        // If there's a stored previous response with the designated header
        try {
            const typ = global.api.sendTypingIndicator(message.threadID); // Start typing indicator

            // Use axios to make the API request for follow-up response
            const { data } = await axios.get('https://gpt4-api-zl5u.onrender.com/api/gpt4o', {
                params: {
                    prompt: `Follow-up on: "${previousResponse}"\nUser reply: "${input}"`,
                    uid: userId
                }
            });

            typ(); // Stop typing indicator

            if (data && data.response) {
                message.send(header + data.response + footer); // Send AI's response with header and footer
                // Update previous response to the new one if it starts with the header
                if (data.response.startsWith(header)) {
                    previousResponses.set(userId, data.response);
                }
            } else {
                message.send(header + "Sorry, I couldn't understand the response from the AI." + footer);
            }
        } catch (error) {
            message.send(header + "An error occurred while trying to reach the AI. Please try again later." + footer);
            console.error("Error while calling AI API:", error);
        }
    } else {
        // If no valid previous response, handle as a new conversation
        try {
            const typ = global.api.sendTypingIndicator(message.threadID); // Start typing indicator

            // Use axios to make the API request
            const { data } = await axios.get('https://gpt4-api-zl5u.onrender.com/api/gpt4o', {
                params: {
                    prompt: input,
                    uid: userId
                }
            });

            typ(); // Stop typing indicator

            if (data && data.response) {
                message.send(header + data.response + footer); // Send AI's response with header and footer
                // Store the response for follow-up if it includes the header
                if (data.response.startsWith(header)) {
                    previousResponses.set(userId, data.response);
                }
            } else {
                message.send(header + "Sorry, I couldn't understand the response from the AI." + footer);
            }
        } catch (error) {
            message.send(header + "An error occurred while trying to reach the AI. Please try again later." + footer);
            console.error("Error while calling AI API:", error);
        }
    }
}

export default {
    config,
    langData,
    onCall
};