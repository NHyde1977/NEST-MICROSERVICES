
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { CreateOrderDto, UpdateOrderDto } from '@app/contracts';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  async create(data: CreateOrderDto) {
    let user: unknown;

    try {
      user = await firstValueFrom(
        this.usersClient
          .send('users.findOne', data.userId)
          .pipe(timeout(3000)),
      );
    } catch (error) {
    
      if (
        error instanceof Error &&
        error.name === 'TimeoutError'
      ) {
        throw new RpcException({
          statusCode: 504,
          message: 'Tempo esgotado ao consultar o serviço de usuários',
        });
      }

      
if (
  error !== null &&
  typeof error === 'object' &&
  (
    ('status' in error && error.status === 404) ||
    ('statusCode' in error && error.statusCode === 404)
  )
) {
  throw new RpcException({
    statusCode: 404,
    message: 'Usuário não encontrado',
  });
}


      throw new RpcException({
        statusCode: 503,
        message: 'Serviço de usuários indisponível',
      });
    }

    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: 'Usuário não encontrado',
      });
    }

    return this.prisma.order.create({
      data: {
        userId: data.userId,
        description: data.description,
        total: data.total,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  update(id: number, data: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
