const { spawn } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\MOURYA T\\AppData\\Local\\Temp\\edge-console-' + Date.now();

async function checkConsole() {
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/admin/login', { method: 'PUT' });
  const target = await newTargetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  const consoleMessages = [];

  let idCounter = 1;
  const callbacks = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push(data.params);
    }
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(resolve => { ws.onopen = resolve; });
  await send('Page.enable');
  await send('Runtime.enable');

  const authRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@colorido2k26.com', password: 'Colorido2k26!' })
  });
  const { token, admin } = await authRes.json();

  await send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('colorido_admin_token', '${token}');
      localStorage.setItem('colorido_admin_user', '${JSON.stringify(admin).replace(/'/g, "\\'")}');
    })()`
  });

  await send('Page.navigate', { url: 'http://localhost:5173/admin/sponsors' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Sponsor'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Console API messages count:', consoleMessages.length);
  const errors = consoleMessages.filter(m => m.type === 'error');
  console.log('Console errors count:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', JSON.stringify(errors, null, 2));
  } else {
    console.log('✓ Zero console errors detected.');
  }

  ws.close();
  edgeProc.kill();
}
checkConsole().catch(console.error);
