import axios from 'axios';

export async function sendSMS(phone: string, text: string) {
  try {
    const response = await axios.post('https://smsethiopia.et/api/sms/send', {
      msisdn: phone,
      text: text
    }, {
      headers: {
        'Authorization': 'Bearer O94LJZ39GJ1KDUIMGW9CEFPESK3VV01C:552'
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
