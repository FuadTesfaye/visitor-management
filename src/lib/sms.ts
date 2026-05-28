import axios from 'axios';

/**
 * Normalise an Ethiopian phone number to international format.
 * Accepts: 09xxxxxxxx | +2519xxxxxxxx | 2519xxxxxxxx | 07xxxxxxxx | 2517xxxxxxxx
 * If includePlus is true, returns: +2519xxxxxxxx
 * If includePlus is false, returns: 2519xxxxxxxx
 */
function normalisePhone(raw: string, includePlus: boolean = false): string {
  const digits = raw.replace(/[\s\-\+]/g, '');
  let standard = '';
  if (digits.startsWith('251')) {
    standard = digits;
  } else if (digits.startsWith('0')) {
    standard = '251' + digits.slice(1);
  } else {
    standard = '251' + digits;
  }
  return includePlus ? '+' + standard : standard;
}

/**
 * Send an SMS via the configured API provider.
 * Supports:
 * 1. AfroMessage (SMS_PROVIDER="afromessage" or AFROMESSAGE_API_KEY set)
 * 2. mySMSEthiopia (default fallback)
 */
export async function sendSMS(phone: string, text: string): Promise<boolean> {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  const afroApiKey = process.env.AFROMESSAGE_API_KEY;
  const mySmsApiKey = process.env.SMS_API_KEY;

  // Auto-detect or explicit select
  const isAfro = provider === 'afromessage' || (!!afroApiKey && !mySmsApiKey);
  const apiKey = isAfro ? (afroApiKey || mySmsApiKey) : (mySmsApiKey || afroApiKey);

  if (!apiKey) {
    console.warn('[SMS] SMS API Key is not set (SMS_API_KEY or AFROMESSAGE_API_KEY is missing) — skipping SMS send');
    return false;
  }

  // Truncate to 160 chars (standard single SMS)
  const safeText = text.length > 160 ? text.slice(0, 157) + '...' : text;

  if (isAfro) {
    const msisdn = normalisePhone(phone, true); // +251... format for AfroMessage
    try {
      console.log(`[SMS] Sending via AfroMessage to ${msisdn}...`);
      const response = await axios.get(
        'https://api.afromessage.com/api/send',
        {
          params: {
            to: msisdn,
            message: safeText,
            sender: 'AfroMessage'
          },
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 10_000,
        }
      );

      // AfroMessage response contains acknowledged field which can be 'success' or true
      const ok = response.status === 200 && response.data?.acknowledge !== 'error';
      if (ok) {
        console.log(`[SMS] ✓ Sent to ${msisdn} via AfroMessage`);
      } else {
        console.warn(`[SMS] AfroMessage API returned error/warning:`, response.data);
      }
      return ok;
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? String(error);
      console.error(`[SMS] ✗ Failed to send to ${msisdn} via AfroMessage:`, msg);
      return false; // never throw
    }
  } else {
    const msisdn = normalisePhone(phone, false); // 251... format for mySMSEthiopia
    try {
      console.log(`[SMS] Sending via mySMSEthiopia to ${msisdn}...`);
      const response = await axios.post(
        'https://smsethiopia.et/api/sms/send',
        { msisdn, text: safeText },
        {
          headers: {
            'KEY': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10_000,
        }
      );

      const ok = response.data?.status === 'success';
      if (ok) {
        console.log(`[SMS] ✓ Sent to ${msisdn} via mySMSEthiopia`);
      } else {
        console.warn(`[SMS] Unexpected mySMSEthiopia response:`, response.data);
      }
      return ok;
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? String(error);
      console.error(`[SMS] ✗ Failed to send to ${msisdn} via mySMSEthiopia:`, msg);
      return false; // never throw
    }
  }
}

/**
 * Generate a cryptographically safe 6-digit OTP.
 * Uses crypto.getRandomValues where available; falls back to Math.random.
 */
export function generateOTP(): string {
  let n: number;
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    n = buf[0] % 900_000 + 100_000; // 100000–999999
  } else {
    n = Math.floor(100_000 + Math.random() * 900_000);
  }
  return String(n);
}
