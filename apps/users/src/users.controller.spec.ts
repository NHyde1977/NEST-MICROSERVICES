
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('deve criar um usuário', () => {
    const dto = {
      name: 'Ana',
      email: 'ana@email.com',
    };

    controller.create(dto);

    expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('deve listar os usuários', () => {
    controller.findAll();

    expect(usersServiceMock.findAll).toHaveBeenCalled();
  });

  it('deve buscar um usuário pelo ID', () => {
    controller.findOne(1);

    expect(usersServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('deve atualizar um usuário', () => {
    const dto = {
      name: 'Ana Atualizada',
    };

    controller.update({
      id: 1,
      data: dto,
    });

    expect(usersServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('deve excluir um usuário', () => {
    controller.remove(1);

    expect(usersServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
