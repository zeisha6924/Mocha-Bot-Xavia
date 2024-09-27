const fontMaps = [
  {
    name: 'cursive',
    map: {
      ' ': ' ',
      'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
      'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺',
      'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃',
      'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗',
      'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠',
      'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
    },
  }
];

const config = {
  name: "font",
  aliases: ["font"],
  description: "Convert text to different fonts",
  usage: "-font <font type> <text>",
  permissions: [0], // Public access
  credits: "Coffee",
};

async function onCall({ message, args }) {
  if (args.length === 1 && args[0].toLowerCase() === 'list') {
    const exampleText = 'Hello';
    const header = '════════════════   𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙵𝚘𝚗𝚝𝚜 ƪ⁠(⁠‾⁠.⁠‾⁠“⁠)⁠┐\n════════════════\n𝙵𝚘𝚗𝚝 𝙽𝚊𝚖𝚎       𝚂𝚊𝚖𝚙𝚕𝚎';

    const maxFontNameLength = Math.max(...fontMaps.map(fontMap => fontMap.name.length));

    const availableFontsList = fontMaps.map((fontMap) => {
      const exampleChar = exampleText.split('')
        .map((char) => fontMap.map[char] || char)
        .join('');

      const formattedFontName = `★ ${fontMap.name.padEnd(maxFontNameLength)}`;
      const padding = ' '.repeat(maxFontNameLength - fontMap.name.length);

      return `${formattedFontName}${padding}  ${exampleChar}`;
    }).join('\n');

    return message.send(`${header}\n${availableFontsList}`);
  }

  if (args.length < 2) {
    return message.send(
      "|｡_｡| Invalid Usage: Please use the command with a font type and text.\n\nExample: -font cursive I love you \n\nChat -font list to see more! •ᴗ•"
    );
  }

  const fontType = args.shift();
  const inputText = args.join(' ');

  const chosenFontMap = fontMaps.find(
    (fontMap) => fontMap.name === fontType.toLowerCase()
  );

  if (!chosenFontMap) {
    const availableFonts = fontMaps.map((fontMap) => `★ ${fontMap.name}`).join('\n');
    return message.send(
      `|｡_｡| Invalid Font Type: Available fonts:\n${availableFonts}\n\nExample: -font cursive Hello! •ᴗ•`
    );
  }

  const outputText = inputText
    .split('')
    .map((char) => chosenFontMap.map[char] || char)
    .join('');

  return message.send(outputText);
}

export default {
  config,
  onCall,
};