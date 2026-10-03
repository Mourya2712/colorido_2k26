const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('C:/Users/MOURYA T/AppData/Roaming/com.vercel.cli/Data/auth.json', 'utf8'));
const teamId = 'team_8ro69LaP686dxHEFG13ejYCO';

async function checkEnvValues() {
  const ids = [
    { name: 'server', id: 'prj_OD284dbjosz0bSChDexDZmOqyjWB' },
    { name: 'colorido-2k26', id: 'prj_WPvi64MD0ASUXuVkmggAdNY4xDGs' },
    { name: 'colorido-2k26-admin', id: 'prj_Ok5o6k1jdauZ7Kms7izN0HXzfeRP' }
  ];

  for (const p of ids) {
    console.log('\n--- Checking env for', p.name, '---');
    const envRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}/env?teamId=${teamId}`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const d = await envRes.json();
    for (const e of (d.envs || [])) {
      const singleRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}/env/${e.id}?teamId=${teamId}`, {
        headers: { Authorization: 'Bearer ' + auth.token }
      });
      const single = await singleRes.json();
      console.log(`  ${single.key} = ${single.value?.substring(0, 30)}... (target: ${single.target?.join(', ')})`);
    }
  }
}
checkEnvValues().catch(console.error);
