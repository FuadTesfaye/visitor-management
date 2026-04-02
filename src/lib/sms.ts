import axios from 'axios';

export async function sendSMS(phone: string, text: string) {
  try {
    const response = await axios.post('https://smsethiopia.et/api/sms/send', {
      msisdn: phone,
      text: text
    }, {
      headers: {
        'KEY': process.env.SMS_API_KEY || '',
        'Content-Type': 'application/json'
      }
    });

    console.log('[SMS] Successfully sent SMS to', phone);
    return response.data;
  } catch (error) {
    console.error('[SMS] Error sending SMS:', error);
    // don't throw to prevent crashing the whole approval flow
    return null;
  }
}
