const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('C:/Users/MOURYA T/AppData/Roaming/com.vercel.cli/Data/auth.json', 'utf8'));
const teamId = 'team_8ro69LaP686dxHEFG13ejYCO';

async function getDepDetails() {
  for (const uid of ['dpl_BJFZT6kwaNLrcqK3VxorkcyarR64', 'dpl_4SnwcqFzedsQCT7erPJxYh3U4zY8', 'dpl_DxyDGWB3GyiNZ2crBRSkAYB8JUAf']) {
    const res = await fetch(`https://api.vercel.com/v13/deployments/${uid}?teamId=${teamId}`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const d = await res.json();
    console.log('\n--- Deployment', uid, '---');
    console.log('Project name:', d.name);
    console.log('URL:', d.url);
    console.log('Routes / Alias:', d.alias);
    console.log('Source:', d.source);
    console.log('Git repo:', d.gitSource);
  }
}
getDepDetails().catch(console.error);
