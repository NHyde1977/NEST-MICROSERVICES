
import { Controller } from '@nestjs/common';

import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { NotificationsService } from './notifications.service.js';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload()
    data: {
      orderId: number;
      userId: number;
      total: string;
    },
    @Ctx() context: unknown,
  ) {
    if (!(context instanceof RmqContext)) {
      throw new Error('Contexto RabbitMQ inválido');
    }

    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.notificationsService.sendOrderNotification(data);

      channel.ack(message);
    } catch (error) {
      channel.nack(message, false, false);
      throw error;
    }
  }
}
