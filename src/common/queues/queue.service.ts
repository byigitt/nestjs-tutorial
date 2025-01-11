import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EmailJob, NotificationJob } from './background.processor';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('background-tasks')
    private readonly backgroundQueue: Queue,
  ) {}

  async addEmailJob(data: EmailJob, delay?: number) {
    try {
      const job = await this.backgroundQueue.add('send-email', data, {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      this.logger.debug(`Added email job ${job.id} to queue`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add email job to queue: ${error.message}`);
      throw error;
    }
  }

  async addNotificationJob(data: NotificationJob, delay?: number) {
    try {
      const job = await this.backgroundQueue.add('send-notification', data, {
        delay,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      });
      this.logger.debug(`Added notification job ${job.id} to queue`);
      return job;
    } catch (error) {
      this.logger.error(
        `Failed to add notification job to queue: ${error.message}`,
      );
      throw error;
    }
  }

  async addCacheCleanupJob(delay?: number) {
    try {
      const job = await this.backgroundQueue.add(
        'cache-cleanup',
        {},
        {
          delay,
          attempts: 1,
          removeOnComplete: true,
        },
      );
      this.logger.debug(`Added cache cleanup job ${job.id} to queue`);
      return job;
    } catch (error) {
      this.logger.error(
        `Failed to add cache cleanup job to queue: ${error.message}`,
      );
      throw error;
    }
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.backgroundQueue.getWaitingCount(),
      this.backgroundQueue.getActiveCount(),
      this.backgroundQueue.getCompletedCount(),
      this.backgroundQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }
}
