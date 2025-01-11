import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

interface NotificationPayload {
  type: string;
  message: string;
  data?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
  port: undefined, // Will be set in constructor
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly configService: ConfigService) {}

  afterInit() {
    this.logger.log(
      `WebSocket Gateway initialized on port ${this.configService.wsPort}`,
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send welcome message
    client.emit('notification', {
      type: 'info',
      message: 'Connected to notification system',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { topics: string[] }) {
    payload.topics.forEach((topic) => {
      client.join(`topic:${topic}`);
    });
    return { event: 'subscribed', data: payload.topics };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { topics: string[] }) {
    payload.topics.forEach((topic) => {
      client.leave(`topic:${topic}`);
    });
    return { event: 'unsubscribed', data: payload.topics };
  }

  broadcastNotification(payload: NotificationPayload) {
    this.server.emit('notification', payload);
  }

  sendNotificationToTopic(topic: string, payload: NotificationPayload) {
    this.server.to(`topic:${topic}`).emit('notification', payload);
  }

  sendNotificationToClient(clientId: string, payload: NotificationPayload) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit('notification', payload);
    }
  }
}
