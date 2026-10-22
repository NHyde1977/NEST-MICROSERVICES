
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import { UsersService } from './users.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('UsersService - exclusão de usuários', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      delete: vi.fn(),
    },
  };

  const ordersClientMock = {
    send: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: 'ORDERS_SERVICE',
          useValue: ordersClientMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve impedir a exclusão quando o usuário possui pedidos', async () => {
    ordersClientMock.send.mockReturnValue(
      of([{ id: 1, userId: 1 }]),
    );

    await expect(service.remove(1)).rejects.toMatchObject({
      error: {
        statusCode: 409,
      },
    });

    expect(ordersClientMock.send).toHaveBeenCalledWith(
      'orders.findByUser',
      1,
    );

    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it('deve impedir a exclusão quando Orders está indisponível', async () => {
    ordersClientMock.send.mockReturnValue(
      throwError(() => new Error('ECONNREFUSED')),
    );

    await expect(service.remove(1)).rejects.toMatchObject({
      error: {
        statusCode: 503,
      },
    });

    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it('deve permitir a exclusão quando o usuário não possui pedidos', async () => {
    const usuario = {
      id: 2,
      name: 'Carlos',
      email: 'carlos@email.com',
    };

    ordersClientMock.send.mockReturnValue(of([]));
    prismaMock.user.delete.mockResolvedValue(usuario);

    await expect(service.remove(2)).resolves.toEqual(usuario);

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it('deve impedir a exclusão quando Orders retorna dados inválidos', async () => {
    ordersClientMock.send.mockReturnValue(of(null));

    await expect(service.remove(1)).rejects.toMatchObject({
      error: {
        statusCode: 503,
      },
    });

    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });
});
