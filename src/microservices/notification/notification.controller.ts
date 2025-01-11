import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NotificationService,
  EmailOptions,
  NotificationOptions,
} from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.sendEmail')
  async sendEmail(@Payload() emailOptions: EmailOptions) {
    this.logger.log(`Received request to send email to ${emailOptions.to}`);
    await this.notificationService.sendEmail(emailOptions);
    return { success: true, message: 'Email sent successfully' };
  }

  @MessagePattern('notification.sendNotification')
  async sendNotification(@Payload() notificationOptions: NotificationOptions) {
    this.logger.log(
      `Received request to send notification to user ${notificationOptions.userId}`,
    );
    await this.notificationService.sendNotification(notificationOptions);
    return { success: true, message: 'Notification sent successfully' };
  }
}
