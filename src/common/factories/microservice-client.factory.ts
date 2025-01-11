import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { microservicesConfig } from '../../config/microservices.config';

export const createUserServiceClient = () => {
  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: microservicesConfig.user.options,
  });
};

export const createAuthServiceClient = () => {
  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: microservicesConfig.auth.options,
  });
};

export const createNotificationServiceClient = () => {
  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: microservicesConfig.notification.options,
  });
};
