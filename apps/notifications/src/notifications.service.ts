
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(
    NotificationsService.name,
  );

  async sendOrderNotification(data: {
    orderId: number;
    userId: number;
    total: string;
  }) {
    this.logger.log(
      `Notificação do pedido ${data.orderId}`,
    );

    this.logger.log(
      `Usuário: ${data.userId}`,
    );

    this.logger.log(
      `Total: R$ ${data.total}`,
    );

    return { success: true };
  }
}
