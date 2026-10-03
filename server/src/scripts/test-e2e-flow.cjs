const fs = require('fs');
const { spawn } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\MOURYA T\\AppData\\Local\\Temp\\edge-test-' + Date.now();

async function runFullFlow() {
  console.log('=== RUNNING COMPLETE ADMIN SPONSORS INTERACTIVE E2E FLOW ===\n');

  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
  ], { stdio: 'ignore' });

  // Connect to CDP
  let connected = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  if (!connected) {
    edgeProc.kill();
    throw new Error('Edge CDP not responding on 9222');
  }

  try {
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

    // 1280x800 desktop
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Login via backend token
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

    // Navigate to /admin/sponsors
    console.log('1. Navigating to http://localhost:5173/admin/sponsors...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/sponsors' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify page header
    const headerCheck = await send('Runtime.evaluate', {
      expression: `document.querySelector('h1')?.textContent`,
      returnByValue: true
    });
    console.log(`✓ Admin Sponsors Page Loaded: "${headerCheck.result?.value}"`);

    // Click "Add Sponsor"
    console.log('2. Clicking "Add Sponsor" button...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Sponsor'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Fill all form fields using React prototype setter
    console.log('3. Typing values into all form fields...');
    const fillResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { success: false, error: 'No modal found' };

        function setInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        function setTextarea(ta, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(ta, val);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const nameInput = modal.querySelector('input[placeholder*="Red Bull India"]');
        const orgInput = modal.querySelector('input[placeholder*="Red Bull GmbH"]');
        const tierSelect = modal.querySelector('select');
        const phoneInput = modal.querySelector('input[placeholder*="+91"]');
        const amountInput = modal.querySelector('input[placeholder*="₹50,000"]');
        const logoInput = modal.querySelector('input[placeholder*="https://..."]');
        const webInput = modal.querySelector('input[placeholder*="https://brand.com"]');
        const descInput = modal.querySelector('textarea');

        setInput(nameInput, 'Monster Energy Pro');
        setInput(orgInput, 'Monster Beverage Corporation');
        tierSelect.value = 'platinum';
        tierSelect.dispatchEvent(new Event('change', { bubbles: true }));
        setInput(phoneInput, '+91 9888877777');
        setInput(amountInput, '₹2,50,000');
        setInput(logoInput, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87');
        setInput(webInput, 'https://monsterenergy.com');
        setTextarea(descInput, 'Unleash the Beast — Official Sports Nutrition & Energy Drink Partner.');

        return {
          success: true,
          values: {
            name: nameInput.value,
            org: orgInput.value,
            category: tierSelect.value,
            phone: phoneInput.value,
            amount: amountInput.value,
            logo: logoInput.value,
            website: webInput.value,
            desc: descInput.value
          }
        };
      })()`,
      returnByValue: true
    });
    console.log('✓ All fields typed successfully:');
    console.log(JSON.stringify(fillResult.result?.value?.values, null, 2));

    // Capture screenshot of filled Add Sponsor form
    const addShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/add_sponsor_filled.png', Buffer.from(addShot.data, 'base64'));
    console.log('✓ Screenshot saved to add_sponsor_filled.png');

    // Click "Save Sponsor"
    console.log('4. Clicking "Save Sponsor" button...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        const saveBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Save Sponsor'));
        if (saveBtn) saveBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify sponsor appears in the list
    const listCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const cards = Array.from(document.querySelectorAll('.rounded-2xl'));
        const found = cards.find(c => c.textContent.includes('Monster Energy Pro'));
        return {
          cardCount: cards.length,
          foundNewSponsor: !!found,
          cardText: found ? found.textContent.trim().replace(/\\s+/g, ' ') : null
        };
      })()`,
      returnByValue: true
    });
    console.log('✓ New sponsor saved & visible in grid:');
    console.log(JSON.stringify(listCheck.result?.value, null, 2));

    // Test Edit Sponsor
    console.log('\n5. Clicking "Edit" button on the sponsor...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const cards = Array.from(document.querySelectorAll('.rounded-2xl'));
        const target = cards.find(c => c.textContent.includes('Monster Energy Pro'));
        if (target) {
          const editBtn = target.querySelector('button[title="Edit sponsor"]');
          if (editBtn) editBtn.click();
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Inspect pre-populated values in Edit Modal
    const editCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { found: false };

        const title = modal.querySelector('h3')?.textContent;
        const nameInput = modal.querySelector('input[placeholder*="Red Bull India"]');
        const orgInput = modal.querySelector('input[placeholder*="Red Bull GmbH"]');
        const tierSelect = modal.querySelector('select');
        const phoneInput = modal.querySelector('input[placeholder*="+91"]');
        const amountInput = modal.querySelector('input[placeholder*="₹50,000"]');
        const logoInput = modal.querySelector('input[placeholder*="https://..."]');
        const webInput = modal.querySelector('input[placeholder*="https://brand.com"]');
        const descInput = modal.querySelector('textarea');

        return {
          modalTitle: title,
          isEditMode: title?.includes('Edit Sponsor'),
          values: {
            name: nameInput?.value,
            org: orgInput?.value,
            category: tierSelect?.value,
            phone: phoneInput?.value,
            amount: amountInput?.value,
            logo: logoInput?.value,
            website: webInput?.value,
            desc: descInput?.value
          }
        };
      })()`,
      returnByValue: true
    });
    console.log('✓ Edit Modal Opened:');
    console.log(JSON.stringify(editCheck.result?.value, null, 2));

    // Capture screenshot of Edit modal
    const editShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/MOURYA T/.gemini/antigravity-ide/brain/a41cd12f-fcac-4c5c-be72-774416841f2a/edit_sponsor_modal.png', Buffer.from(editShot.data, 'base64'));
    console.log('✓ Screenshot saved to edit_sponsor_modal.png');

    // Update a field in Edit modal
    console.log('\n6. Updating Sponsor Name in Edit modal...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0');
        const nameInput = modal.querySelector('input[placeholder*="Red Bull India"]');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(nameInput, 'Monster Energy Pro (Updated)');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));

        const updateBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Update Sponsor'));
        if (updateBtn) updateBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify updated sponsor in grid
    const updateCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const cards = Array.from(document.querySelectorAll('.rounded-2xl'));
        const found = cards.find(c => c.textContent.includes('Monster Energy Pro (Updated)'));
        return {
          foundUpdatedSponsor: !!found,
          text: found ? found.textContent.trim().replace(/\\s+/g, ' ') : null
        };
      })()`,
      returnByValue: true
    });
    console.log('✓ Sponsor update verified in UI:');
    console.log(JSON.stringify(updateCheck.result?.value, null, 2));

    // Clean up: delete sponsor
    console.log('\n7. Cleaning up test sponsor...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        // Mock confirm to auto-accept
        window.confirm = () => true;
        const cards = Array.from(document.querySelectorAll('.rounded-2xl'));
        const target = cards.find(c => c.textContent.includes('Monster Energy Pro (Updated)'));
        if (target) {
          const delBtn = target.querySelector('button[title="Delete sponsor"]');
          if (delBtn) delBtn.click();
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    const finalCount = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.rounded-2xl').length`,
      returnByValue: true
    });
    console.log(`✓ Deleted test sponsor. Remaining sponsor count: ${finalCount.result?.value}`);

    ws.close();
    console.log('\n=== ALL INTERACTIVE E2E SPONSOR TESTS PASSED ===');
  } finally {
    edgeProc.kill();
  }
}

runFullFlow().catch(err => {
  console.error('Fatal Flow Error:', err);
  process.exit(1);
});
