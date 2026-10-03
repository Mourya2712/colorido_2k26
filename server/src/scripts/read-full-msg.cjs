const fs = require('fs');
const readline = require('readline');
const stream = fs.createReadStream('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: stream });
let targetMsg = '';
rl.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"') && line.includes('ISSUE 1')) {
    targetMsg = JSON.parse(line).content;
  }
});
rl.on('close', () => {
  fs.writeFileSync('server/src/scripts/prompt_full.txt', targetMsg, 'utf8');
  console.log('Saved to prompt_full.txt! Length:', targetMsg.length);
});
