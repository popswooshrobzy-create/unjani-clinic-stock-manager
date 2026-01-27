import { notifyOwner } from "./_core/notification";

/**
 * Send SMS notification to a user
 * In production, integrate with Twilio or similar SMS provider
 */
export async function sendSmsNotification(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (!phoneNumber) {
      console.warn("No phone number provided for SMS notification");
      return false;
    }
    
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    console.log(`[SMS] To: ${phoneNumber}, Message: ${message}`);
    
    // For now, log to console. In production, use actual SMS service
    return true;
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    return false;
  }
}

/**
 * Send email notification to a user
 * In production, integrate with email service provider
 */
export async function sendEmailNotification(email: string, subject: string, message: string): Promise<boolean> {
  try {
    if (!email) {
      console.warn("No email provided for email notification");
      return false;
    }
    
    // TODO: Integrate with email provider (SendGrid, Mailgun, etc.)
    console.log(`[EMAIL] To: ${email}, Subject: ${subject}, Message: ${message}`);
    
    // For now, log to console. In production, use actual email service
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
}

/**
 * Send low stock alert to stock controllers
 */
export async function sendLowStockAlert(
  stockControllers: Array<{ name: string; email: string; phoneNumber?: string }>,
  itemName: string,
  currentQuantity: number,
  threshold: number,
  dispensaryName: string
): Promise<void> {
  const message = `CRITICAL ALERT: Stock level for "${itemName}" is critically low! Current: ${currentQuantity} units (Threshold: ${threshold}) at ${dispensaryName}`;
  const emailSubject = `Critical Stock Alert: ${itemName}`;
  
  // Send notifications to all stock controllers
  for (const controller of stockControllers) {
    // Send email
    if (controller.email) {
      await sendEmailNotification(
        controller.email,
        emailSubject,
        `${message}\n\nPlease restock immediately.`
      );
    }
    
    // Send SMS
    if (controller.phoneNumber) {
      await sendSmsNotification(
        controller.phoneNumber,
        `${itemName} is critically low (${currentQuantity}/${threshold}) at ${dispensaryName}. Please restock immediately.`
      );
    }
  }
  
  // Notify clinic owner
  await notifyOwner({
    title: "Critical Stock Alert",
    content: `${itemName} is critically low at ${dispensaryName}. Current: ${currentQuantity} units (Threshold: ${threshold})`,
  });
}

/**
 * Send expiration alert to stock controllers
 */
export async function sendExpirationAlert(
  stockControllers: Array<{ name: string; email: string; phoneNumber?: string }>,
  itemName: string,
  expirationDate: Date,
  dispensaryName: string
): Promise<void> {
  const daysUntilExpiry = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const message = `EXPIRATION ALERT: "${itemName}" expires in ${daysUntilExpiry} days at ${dispensaryName}`;
  const emailSubject = `Expiration Alert: ${itemName}`;
  
  for (const controller of stockControllers) {
    if (controller.email) {
      await sendEmailNotification(
        controller.email,
        emailSubject,
        `${message}\n\nPlease review and use before expiration.`
      );
    }
    
    if (controller.phoneNumber) {
      await sendSmsNotification(
        controller.phoneNumber,
        `${itemName} expires in ${daysUntilExpiry} days at ${dispensaryName}.`
      );
    }
  }
}
