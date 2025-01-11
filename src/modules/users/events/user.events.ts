import { DomainEvent } from '../../../common/events/base/base.event';
import { User } from '../entities/user.entity';

export class UserCreatedEvent extends DomainEvent {
  static readonly eventName = 'user.created';

  constructor(
    public readonly user: User,
    correlationId?: string,
  ) {
    super(user._id.toString(), UserCreatedEvent.eventName, 1, correlationId);
  }
}

export class UserUpdatedEvent extends DomainEvent {
  static readonly eventName = 'user.updated';

  constructor(
    public readonly user: User,
    public readonly changes: Partial<User>,
    correlationId?: string,
  ) {
    super(user._id.toString(), UserUpdatedEvent.eventName, 1, correlationId);
  }
}

export class UserDeletedEvent extends DomainEvent {
  static readonly eventName = 'user.deleted';

  constructor(
    public readonly userId: string,
    correlationId?: string,
  ) {
    super(userId, UserDeletedEvent.eventName, 1, correlationId);
  }
}

export class UserLoginEvent extends DomainEvent {
  static readonly eventName = 'user.login';

  constructor(
    public readonly user: User,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    correlationId?: string,
  ) {
    super(user._id.toString(), UserLoginEvent.eventName, 1, correlationId);
  }
}
