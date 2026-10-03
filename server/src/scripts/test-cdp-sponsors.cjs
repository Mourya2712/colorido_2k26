const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\MOURYA T\\AppData\\Local\\Temp\\edge-cdp-profile-' + Date.now();

async function runCDP() {
  console.log('Launching headless Edge...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore' });

  // Poll until CDP port 9222 is alive
  let connected = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        connected = true;
        const v = await res.json();
        console.log('Connected to Edge CDP:', v.Browser);
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!connected) {
    edgeProc.kill();
    throw new Error('Could not connect to Edge on port 9222 after 15s');
  }

  try {
    // Create new target
    const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/admin/login', { method: 'PUT' });
    const target = await newTargetRes.json();
    const wsUrl = target.webSocketDebuggerUrl;
    console.log('Target created:', target.id);

    const ws = new WebSocket(wsUrl);

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

    await new Promise((resolve) => { ws.onopen = resolve; });
    console.log('CDP WebSocket connected.');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // Viewport: 1280x800
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait for login page load
    await new Promise(r => setTimeout(r, 2000));

    // Inject Admin auth token directly into localStorage to bypass form submit or do login
    console.log('Authenticating in browser...');
    // Let's get token from backend directly
    const authRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@colorido2k26.com', password: 'Colorido2k26!' })
    });
    const authData = await authRes.json();
    const token = authData.token;
    const admin = authData.admin;

    await send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.setItem('colorido_admin_token', '${token}');
        localStorage.setItem('colorido_admin_user', '${JSON.stringify(admin).replace(/'/g, "\\'")}');
        return 'AUTH_STORED';
      })()`,
      returnByValue: true
    });
    console.log('Admin token stored in browser localStorage.');

    // Navigate directly to /admin/sponsors
    console.log('Navigating to http://localhost:5173/admin/sponsors...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/sponsors' });
    await new Promise(r => setTimeout(r, 2500));

    // Check page
    const pageCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          url: window.location.href,
          h1: document.querySelector('h1')?.textContent,
          addBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Sponsor'))
        };
      })()`,
      returnByValue: true
    });
    console.log('Page state:', pageCheck.result?.value);

    // Click "Add Sponsor"
    console.log('Clicking "Add Sponsor"...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Sponsor'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Detailed inspection of the modal and its positioning
    const inspection = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { found: false };

        const card = modal.querySelector('.rounded-3xl');
        const form = modal.querySelector('form');
        const header = modal.querySelector('.border-b');
        const footer = modal.querySelector('.border-t');
        const scrollableBody = form ? form.querySelector('.overflow-y-auto') : null;

        const inputs = Array.from(modal.querySelectorAll('input, select, textarea'));
        const buttons = Array.from(modal.querySelectorAll('button'));

        const cardRect = card ? card.getBoundingClientRect() : null;
        const pageHeader = document.querySelector('header');
        const pageHeaderRect = pageHeader ? pageHeader.getBoundingClientRect() : null;

        return {
          found: true,
          portalParent: modal.parentElement.tagName + (modal.parentElement.id ? '#' + modal.parentElement.id : ''),
          viewport: { w: window.innerWidth, h: window.innerHeight },
          cardRect: cardRect ? {
            top: Math.round(cardRect.top),
            bottom: Math.round(cardRect.bottom),
            left: Math.round(cardRect.left),
            right: Math.round(cardRect.right),
            width: Math.round(cardRect.width),
            height: Math.round(cardRect.height)
          } : null,
          pageHeaderRect: pageHeaderRect ? {
            top: Math.round(pageHeaderRect.top),
            bottom: Math.round(pageHeaderRect.bottom),
            height: Math.round(pageHeaderRect.height)
          } : null,
          isClippedTop: cardRect ? cardRect.top < 0 : false,
          isClippedBottom: cardRect ? cardRect.bottom > window.innerHeight : false,
          isClippedLeft: cardRect ? cardRect.left < 0 : false,
          isClippedRight: cardRect ? cardRect.right > window.innerWidth : false,
          isUnderPageHeader: (cardRect && pageHeaderRect) ? (cardRect.top < pageHeaderRect.bottom) : false,
          hasScrollableBody: !!scrollableBody,
          bodyScrollHeight: scrollableBody ? scrollableBody.scrollHeight : null,
          bodyClientHeight: scrollableBody ? scrollableBody.clientHeight : null,
          fieldsCount: inputs.length,
          fields: inputs.map(i => ({
            name: i.previousElementSibling?.textContent?.trim() || i.placeholder,
            tag: i.tagName,
            top: Math.round(i.getBoundingClientRect().top),
            height: Math.round(i.getBoundingClientRect().height),
            visible: i.getBoundingClientRect().height > 0
          })),
          buttons: buttons.map(b => ({
            text: b.textContent.trim(),
            top: Math.round(b.getBoundingClientRect().top),
            visible: b.getBoundingClientRect().height > 0
          }))
        };
      })()`,
      returnByValue: true
    });

    console.log('\n================ DESKTOP (1280x800) INSPECTION ================');
    console.log(JSON.stringify(inspection.result?.value, null, 2));

    // Capture desktop screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = 'C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/desktop_modal_test.png';
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Desktop screenshot saved to:', shotPath);

    // Test typing into all fields
    console.log('\nTesting typing into every field...');
    const fillResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return 'NO_MODAL';

        const nameInput = modal.querySelector('input[placeholder*="Red Bull India"]');
        const orgInput = modal.querySelector('input[placeholder*="Red Bull GmbH"]');
        const tierSelect = modal.querySelector('select');
        const phoneInput = modal.querySelector('input[placeholder*="+91"]');
        const amountInput = modal.querySelector('input[placeholder*="₹50,000"]');
        const logoInput = modal.querySelector('input[placeholder*="https://..."]');
        const webInput = modal.querySelector('input[placeholder*="https://brand.com"]');
        const descInput = modal.querySelector('textarea');

        if (!nameInput) return 'INPUTS_MISSING';

        nameInput.value = 'Apex Esports Arena';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));

        orgInput.value = 'Apex Gaming Group';
        orgInput.dispatchEvent(new Event('input', { bubbles: true }));

        tierSelect.value = 'title';
        tierSelect.dispatchEvent(new Event('change', { bubbles: true }));

        phoneInput.value = '+91 9123456789';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

        amountInput.value = '₹75,000';
        amountInput.dispatchEvent(new Event('input', { bubbles: true }));

        logoInput.value = 'https://images.unsplash.com/photo-1542751371-adc38448a05e';
        logoInput.dispatchEvent(new Event('input', { bubbles: true }));

        webInput.value = 'https://apexarena.gg';
        webInput.dispatchEvent(new Event('input', { bubbles: true }));

        descInput.value = 'Official Gaming & Esports Stage Partner.';
        descInput.dispatchEvent(new Event('input', { bubbles: true }));

        return {
          name: nameInput.value,
          org: orgInput.value,
          tier: tierSelect.value,
          phone: phoneInput.value,
          amount: amountInput.value,
          logo: logoInput.value,
          website: webInput.value,
          desc: descInput.value
        };
      })()`,
      returnByValue: true
    });
    console.log('Fill result:', fillResult.result?.value);

    // Save screenshot of filled form
    const shotFilled = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/desktop_modal_filled.png', Buffer.from(shotFilled.data, 'base64'));

    // Test mobile width (375x667)
    console.log('\n================ MOBILE (375x667) TEST ================');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    const mobileInsp = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { found: false };
        const card = modal.querySelector('.rounded-3xl');
        const cardRect = card ? card.getBoundingClientRect() : null;
        return {
          viewport: { w: window.innerWidth, h: window.innerHeight },
          cardRect: cardRect ? {
            top: Math.round(cardRect.top),
            bottom: Math.round(cardRect.bottom),
            left: Math.round(cardRect.left),
            right: Math.round(cardRect.right),
            width: Math.round(cardRect.width),
            height: Math.round(cardRect.height)
          } : null,
          isClippedHorizontally: cardRect ? (cardRect.left < 0 || cardRect.right > window.innerWidth) : false,
          isClippedVertically: cardRect ? (cardRect.top < 0 || cardRect.bottom > window.innerHeight) : false
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(mobileInsp.result?.value, null, 2));

    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/mobile_modal_test.png', Buffer.from(mobileShot.data, 'base64'));
    console.log('Mobile screenshot saved to mobile_modal_test.png');

    ws.close();
  } finally {
    edgeProc.kill();
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    console.log('Edge process terminated and temp profile cleaned.');
  }
}

runCDP().catch(err => {
  console.error('Fatal CDP error:', err);
  process.exit(1);
});
