import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
  name: 'pinterest',
  aliases: ["pin"],
  version: '1.1.0',
  credits: 'Hadi Pranata',
  description: 'Search Images in Pinterest',
  usages: '<query> <amount>',
  cooldown: 10
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = `${__dirname}/cache`;

// Ensure cache folder exists
const ensureCacheFolderExists = async () => {
  try {
    await fs.ensureDir(cacheFolder);
  } catch (error) {
    console.error(`[ERROR] Failed to create cache folder: ${cacheFolder}\n`, error);
  }
};

const onCall = async ({ message, args }) => {
  const { messageID, threadID } = message;
  const keySearch = args.join(' ');

  // Validate input
  if (!keySearch.includes('-')) {
    return message.send(`📷 | Please follow this format:\n-pinterest cat -5`, threadID, messageID);
  }

  const [keySearchs, numberSearch] = keySearch.split('-').map((str, index) => index === 1 ? str || 6 : str.trim());

  // Ensure cache folder exists
  await ensureCacheFolderExists();
  await message.react("⌛");

  try {
    // Fetch images from the API
    const res = await axios.get(`https://deku-rest-api.gleeze.com/api/pinterest?q=${encodeURIComponent(keySearchs)}`);
    const data = res.data.result || [];
    const imgData = [];

    // Download and cache images
    for (let i = 0; i < Math.min(parseInt(numberSearch), data.length); i++) {
      const imageBuffer = (await axios.get(data[i], { responseType: 'arraybuffer' })).data;
      const path = `${cacheFolder}/${i + 1}.jpg`;
      fs.writeFileSync(path, imageBuffer);
      imgData.push(fs.createReadStream(path));
    }

    await message.react("✔️");

    // Send images as a message
    message.send({
      attachment: imgData,
      body: `Here are ${imgData.length} results for "${keySearchs}"`
    }, threadID, messageID);

  } catch (error) {
    console.error(`[ERROR] An error occurred while processing your request:\n`, error);
    message.send(`❌ | An error occurred while fetching images. Please try again later.`, threadID, messageID);
  } finally {
    // Clean up cached images
    imgData.forEach((_, index) => {
      const filePath = `${cacheFolder}/${index + 1}.jpg`;
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`[ERROR] Failed to delete cache file: ${filePath}\n`, error);
      }
    });
  }
};

export default {
  config,
  onCall,
};