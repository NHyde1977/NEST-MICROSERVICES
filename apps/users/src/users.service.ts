import { firstValueFrom, timeout } from 'rxjs';
import { Inject } from '@nestjs/common';
import {
  ClientProxy,
  RpcException,
} from '@nestjs/microservices';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service.js';

import {
  CreateUserDto,
  UpdateUserDto,
} from '@app/contracts';

@Injectable()
export class UsersService {
  constructor(
  private readonly prisma: PrismaService,

  @Inject('ORDERS_SERVICE')
  private readonly ordersClient: ClientProxy,
) {}

  create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
  throw new RpcException({
    statusCode: 404,
    message: 'Usuário não encontrado',
  });
}

    return user;
  }

  update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
  let orders: unknown;

  try {
    orders = await firstValueFrom(
      this.ordersClient
        .send('orders.findByUser', id)
        .pipe(timeout(3000)),
    );
  } catch {
    throw new RpcException({
      statusCode: 503,
      message: 'Não foi possível verificar os pedidos do usuário',
    });
  }

  if (!Array.isArray(orders)) {
    throw new RpcException({
      statusCode: 503,
      message: 'Resposta inválida do serviço de pedidos',
    });
  }

  if (orders.length > 0) {
    throw new RpcException({
      statusCode: 409,
      message: 'Usuário possui pedidos vinculados e não pode ser excluído',
    });
  }

  return this.prisma.user.delete({
    where: { id },
  });
}
}
