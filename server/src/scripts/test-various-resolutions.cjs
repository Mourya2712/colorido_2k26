const { spawn } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\MOURYA T\\AppData\\Local\\Temp\\edge-res-' + Date.now();

async function testResolutions() {
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
  await new Promise(r => setTimeout(r, 800));

  const viewports = [
    { name: 'Full HD Desktop', w: 1920, h: 1080 },
    { name: 'Standard Laptop 768p', w: 1366, h: 768 },
    { name: 'Compact Laptop 720p', w: 1280, h: 720 },
    { name: 'Laptop with scaling / toolbars', w: 1280, h: 600 },
    { name: 'Small viewport / split screen', w: 1024, h: 520 },
    { name: 'Mobile 375x667', w: 375, h: 667 }
  ];

  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.w < 600
    });
    await new Promise(r => setTimeout(r, 500));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        const card = modal ? modal.querySelector('.rounded-3xl') : null;
        const nameInput = modal ? modal.querySelector('input[placeholder*="Red Bull India"]') : null;
        const nameLabel = nameInput ? nameInput.closest('div')?.querySelector('label') : null;

        const cardRect = card ? card.getBoundingClientRect() : null;
        const nameRect = nameInput ? nameInput.getBoundingClientRect() : null;
        const labelRect = nameLabel ? nameLabel.getBoundingClientRect() : null;

        return {
          viewport: { w: window.innerWidth, h: window.innerHeight },
          cardTop: cardRect ? Math.round(cardRect.top) : null,
          cardBottom: cardRect ? Math.round(cardRect.bottom) : null,
          cardHeight: cardRect ? Math.round(cardRect.height) : null,
          labelTop: labelRect ? Math.round(labelRect.top) : null,
          nameInputTop: nameRect ? Math.round(nameRect.top) : null,
          nameInputVisible: nameRect ? (nameRect.top >= 0 && nameRect.bottom <= window.innerHeight) : false,
          isClippedTop: cardRect ? cardRect.top < 0 : false,
          isClippedBottom: cardRect ? cardRect.bottom > window.innerHeight : false
        };
      })()`,
      returnByValue: true
    });

    console.log(`--- Viewport: ${vp.name} (${vp.w}x${vp.h}) ---`);
    console.log(JSON.stringify(check.result?.value, null, 2));
  }

  ws.close();
  edgeProc.kill();
}

testResolutions().catch(console.error);
