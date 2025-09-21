// Copy/paste this entire file into Extensions → Apps Script, then Deploy → New deployment → Web app.
// Fill the placeholders below before deploying.

// ===================== CONFIG =====================
const SHEET_ID = 'YOUR_SHEET_ID_HERE';           // e.g. 1KHFLyH... (between /d/ and /edit in Sheet URL)
const SHEET_NAME = 'Submissions';                 // or your desired tab name
const TURNSTILE_SECRET = 'YOUR_TURNSTILE_SECRET'; // Cloudflare Turnstile secret (server-side only)
// ==================================================

/**
 * Web App entrypoint - handles form POSTs (urlencoded/multipart) and JSON (text/plain or application/json).
 */
function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data.turnstile_token) {
      return json({ ok: false, error: 'Missing token' });
    }

    // Verify Turnstile token server-side
    var verify = verifyTurnstile(data.turnstile_token);
    if (!verify.success) {
      return json({ ok: false, error: 'Turnstile failed' });
    }

    // Append row
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    var now = new Date();
    var ip = (e && e.headers && e.headers['x-forwarded-for']) || 'n/a';
    var ua = (e && e.headers && e.headers['user-agent']) || 'n/a';

    sheet.appendRow([
      now,
      safe(data.name),
      safe(data.phone),
      safe(data.address),
      safe(data.city),
      safe(data.state),
      safe(data.zip),
      safe(data.message),
      ip,
      ua
    ]);

    return json({ ok: true });
  } catch (err) {
    Logger.log('Error: ' + err);
    return json({ ok: false, error: 'Server error' });
  }
}

/**
 * Optional health check: open the Web App URL with GET to see {ok:true}.
 */
function doGet() {
  return json({ ok: true });
}

// ===================== HELPERS =====================
function parseBody(e) {
  // Prefer form fields if present (from an HTML form POST)
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return {
      name: e.parameter.name || '',
      phone: e.parameter.phone || '',
      address: e.parameter.address || '',
      city: e.parameter.city || '',
      state: e.parameter.state || '',
      zip: e.parameter.zip || '',
      message: e.parameter.message || '',
      turnstile_token: e.parameter.turnstile_token || ''
    };
  }
  // Fallback: try parsing JSON from raw body (text/plain or application/json)
  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  try { return JSON.parse(raw) || {}; } catch (err) { return {}; }
}

function verifyTurnstile(token) {
  var resp = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: TURNSTILE_SECRET, response: token },
    muteHttpExceptions: true
  });
  try { return JSON.parse(resp.getContentText() || '{}'); } catch (err) { return { success: false }; }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safe(v) { return (v == null ? '' : String(v)); }
