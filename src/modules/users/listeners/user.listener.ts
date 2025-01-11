import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserLoginEvent,
} from '../events/user.events';
import { QueueService } from '../../../common/queues/queue.service';

@Injectable()
export class UserEventsListener {
  private readonly logger = new Logger(UserEventsListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(UserCreatedEvent.eventName)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.user.email}`);

    await this.queueService.addEmailJob({
      to: event.user.email,
      subject: 'Welcome to our platform!',
      template: 'welcome',
      context: {
        name: event.user.firstName,
      },
    });
  }

  @OnEvent(UserUpdatedEvent.eventName)
  async handleUserUpdatedEvent(event: UserUpdatedEvent) {
    this.logger.log(
      `User ${event.user.email} updated. Changes: ${JSON.stringify(event.changes)}`,
    );
  }

  @OnEvent(UserDeletedEvent.eventName)
  async handleUserDeletedEvent(event: UserDeletedEvent) {
    this.logger.log(`User deleted: ${event.userId}`);

    await this.queueService.addCacheCleanupJob();
  }

  @OnEvent(UserLoginEvent.eventName)
  async handleUserLoginEvent(event: UserLoginEvent) {
    this.logger.log(
      `User ${event.user.email} logged in from ${event.ipAddress} using ${event.userAgent}`,
    );

    if (this.isSuspiciousLogin(event)) {
      await this.queueService.addNotificationJob({
        userId: event.user._id.toString(),
        type: 'security',
        title: 'Suspicious Login Detected',
        message: `New login from ${event.ipAddress} using ${event.userAgent}`,
      });
    }
  }

  private isSuspiciousLogin(_event: UserLoginEvent): boolean {
    // TODO: Implement suspicious login detection logic
    // For example: check if IP is from a different country, unusual user agent, etc.
    return false;
  }
}
