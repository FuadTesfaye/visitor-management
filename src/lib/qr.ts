import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateQRToken = (): string => {
  return uuidv4();
};

export const generateQRCode = async (token: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(token, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const getQRExpirationTime = (hours: number = 24): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
};
