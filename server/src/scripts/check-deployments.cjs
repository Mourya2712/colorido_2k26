const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('C:/Users/MOURYA T/AppData/Roaming/com.vercel.cli/Data/auth.json', 'utf8'));
const teamId = 'team_8ro69LaP686dxHEFG13ejYCO';

async function checkDeployments() {
  const ids = [
    { name: 'server', id: 'prj_OD284dbjosz0bSChDexDZmOqyjWB' },
    { name: 'colorido-2k26', id: 'prj_WPvi64MD0ASUXuVkmggAdNY4xDGs' },
    { name: 'colorido-2k26-admin', id: 'prj_Ok5o6k1jdauZ7Kms7izN0HXzfeRP' }
  ];

  for (const p of ids) {
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${p.id}&teamId=${teamId}&limit=3`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const d = await res.json();
    console.log('\n--- Deployments for', p.name, '---');
    for (const dep of (d.deployments || [])) {
      console.log(dep.uid, dep.url, dep.state, dep.target, new Date(dep.created).toLocaleString());
    }

    const projRes = await fetch(`https://api.vercel.com/v9/projects/${p.id}?teamId=${teamId}`, {
      headers: { Authorization: 'Bearer ' + auth.token }
    });
    const proj = await projRes.json();
    console.log('Root Directory:', proj.rootDirectory);
    console.log('Build Command:', proj.buildCommand);
    console.log('Output Directory:', proj.outputDirectory);
    console.log('Framework:', proj.framework);
  }
}
checkDeployments().catch(console.error);
