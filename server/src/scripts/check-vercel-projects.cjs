const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('C:/Users/MOURYA T/AppData/Roaming/com.vercel.cli/Data/auth.json', 'utf8'));
const teamId = 'team_8ro69LaP686dxHEFG13ejYCO';

async function checkProjects() {
  const ids = [
    { name: 'server', id: 'prj_OD284dbjosz0bSChDexDZmOqyjWB' },
    { name: 'colorido-2k26', id: 'prj_WPvi64MD0ASUXuVkmggAdNY4xDGs' },
    { name: 'colorido-2k26-admin', id: 'prj_Ok5o6k1jdauZ7Kms7izN0HXzfeRP' }
  ];

  for (const p of ids) {
    const projRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}?teamId=${teamId}`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const proj = await projRes.json();
    console.log('\n==============================');
    console.log('Project:', p.name);
    console.log('Production URL:', proj.targets?.production?.url);
    console.log('Aliases:', proj.targets?.production?.alias);

    const envRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}/env?teamId=${teamId}`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const envs = await envRes.json();
    console.log('Env keys:', (envs.envs || []).map(e => e.key));
  }
}
checkProjects().catch(console.error);
