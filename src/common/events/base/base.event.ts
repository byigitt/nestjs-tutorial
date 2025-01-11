export abstract class BaseEvent {
  constructor(
    public readonly eventName: string,
    public readonly timestamp: Date = new Date(),
    public readonly correlationId?: string,
  ) {}

  toString(): string {
    return `${this.eventName} at ${this.timestamp.toISOString()}`;
  }
}

export abstract class DomainEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    eventName: string,
    public readonly version: number = 1,
    correlationId?: string,
  ) {
    super(eventName, new Date(), correlationId);
  }
}

export abstract class IntegrationEvent extends BaseEvent {
  constructor(
    public readonly source: string,
    eventName: string,
    public readonly payload: unknown,
    correlationId?: string,
  ) {
    super(eventName, new Date(), correlationId);
  }
}
