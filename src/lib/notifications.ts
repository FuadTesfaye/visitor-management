import { prisma } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  phone?: string | null;
}

/**
 * Service to handle in-app notifications and external messaging (SMS/Email)
 * based on system settings.
 */
export async function notifyUser(payload: NotificationPayload) {
  try {
    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
      }
    });

    // 2. Fetch System Settings
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['enableSmsNotifications', 'enableEmailNotifications'] }
      }
    });

    const smsSetting = settings.find(s => s.key === 'enableSmsNotifications');
    const isSmsEnabled = smsSetting?.value === 'true';

    // 3. Send SMS if enabled and phone exists
    if (isSmsEnabled && payload.phone) {
      await sendSMS(payload.phone, `Tracon VMS - ${payload.title}: ${payload.message}`);
    }

    // Email logic would go here if an email provider was configured
    
  } catch (error) {
    console.error('[Notifications Engine] Failed to send notification:', error);
  }
}

/**
 * Convenience function to notify an approver about a new request
 */
export async function notifyApproverOfNewRequest(approverId: string, visitorName: string, approverPhone?: string | null) {
  await notifyUser({
    userId: approverId,
    title: 'New Visitor Request',
    message: `You have a new visitor request pending approval for ${visitorName}.`,
    type: 'info',
    phone: approverPhone,
  });
}

/**
 * Convenience function to notify a host employee that they have a visitor
 */
export async function notifyHostOfVisitor(hostId: string, visitorName: string, hostPhone?: string | null) {
  await notifyUser({
    userId: hostId,
    title: 'Visitor Arrived',
    message: `Your visitor ${visitorName} has been checked in and is arriving now.`,
    type: 'success',
    phone: hostPhone,
  });
}
