import { Transport, TcpOptions } from '@nestjs/microservices';

export const microservicesConfig: Record<string, TcpOptions> = {
  user: {
    transport: Transport.TCP,
    options: {
      host: process.env.USER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.USER_SERVICE_PORT || '3001', 10),
    },
  },
  auth: {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3002', 10),
    },
  },
  notification: {
    transport: Transport.TCP,
    options: {
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3003', 10),
    },
  },
};
