
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';

import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersServiceMock = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('deve criar um pedido', () => {
    const dto = {
      userId: 1,
      description: 'Pedido de teste',
      total: 149.9,
    };

    controller.create(dto);

    expect(ordersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('deve listar os pedidos', () => {
    controller.findAll();

    expect(ordersServiceMock.findAll).toHaveBeenCalled();
  });

  it('deve buscar um pedido pelo ID', () => {
    controller.findOne(1);

    expect(ordersServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  
it('deve atualizar um pedido', () => {
  const dto = {
    description: 'Pedido atualizado',
    total: 199.9,
  };

  controller.update({
    id: 1,
    data: dto,
  });

  expect(ordersServiceMock.update).toHaveBeenCalledWith(
    1,
    dto,
  );
});

it('deve excluir um pedido', () => {
  controller.remove(1);

  expect(ordersServiceMock.remove).toHaveBeenCalledWith(1);
});

});
