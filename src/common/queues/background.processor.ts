import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsGateway } from '../gateways/notifications.gateway';

export interface EmailJob {
  to: string;
  subject: string;
  content?: string;
  template?: string;
  context?: Record<string, any>;
}

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  topic?: string;
}

export interface CacheCleanupJob {
  keys: string[];
}

@Processor('background-tasks')
export class BackgroundProcessor {
  private readonly logger = new Logger(BackgroundProcessor.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @Process('send-email')
  async handleEmailJob(job: Job<EmailJob>) {
    this.logger.debug(`Processing email job ${job.id}`);
    const { to, subject } = job.data;

    try {
      // Implement email sending logic here
      this.logger.log(`Sending email to ${to}: ${subject}`);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  @Process('send-notification')
  async handleNotificationJob(job: Job<NotificationJob>) {
    this.logger.debug(`Processing notification job ${job.id}`);
    const { type, message, userId, topic } = job.data;

    try {
      if (userId) {
        this.notificationsGateway.sendNotificationToClient(userId, {
          type,
          message,
        });
      } else if (topic) {
        this.notificationsGateway.sendNotificationToTopic(topic, {
          type,
          message,
        });
      } else {
        this.notificationsGateway.broadcastNotification({
          type,
          message,
        });
      }

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  @Process('cache-cleanup')
  async handleCacheCleanup(job: Job) {
    this.logger.debug(`Processing cache cleanup job ${job.id}`);

    try {
      // Implement cache cleanup logic here
      this.logger.log('Cleaning up cache');

      // Simulate cleanup delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, message: 'Cache cleaned successfully' };
    } catch (error) {
      this.logger.error(`Failed to clean cache: ${error.message}`);
      throw error;
    }
  }
}
