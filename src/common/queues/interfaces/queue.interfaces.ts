export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
}

export interface CacheCleanupJob {
  pattern: string;
}
