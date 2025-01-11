import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
  html?: string;
}

export interface NotificationOptions {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      this.logger.log(`Sending email to ${options.to}`);

      if (options.template) {
        await this.mailerService.sendMail({
          to: options.to,
          subject: options.subject,
          template: options.template,
          context: options.context,
        });
      } else {
        await this.mailerService.sendMail({
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
      }

      this.logger.log(`Email sent successfully to ${options.to}`);
      this.eventEmitter.emit('email.sent', {
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    try {
      this.logger.log(`Sending notification to user ${options.userId}`);

      // Emit event for real-time notification
      this.eventEmitter.emit('notification.created', {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        data: options.data,
        timestamp: new Date(),
      });

      this.logger.log(
        `Notification sent successfully to user ${options.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${options.userId}`,
        error.stack,
      );
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }
}
