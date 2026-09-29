const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1509')) {
    try {
      const obj = JSON.parse(line);
      fs.writeFileSync('prompt_1509.txt', obj.content);
      console.log('Successfully saved prompt_1509.txt, length:', obj.content.length);
    } catch (e) {
      console.error(e);
    }
  }
});
