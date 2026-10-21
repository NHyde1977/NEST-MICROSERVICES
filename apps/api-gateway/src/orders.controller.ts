import { Delete, Patch } from '@nestjs/common';
import { UpdateOrderDto } from '@app/contracts';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '@app/contracts';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.client.send('orders.create', dto);
  }

  @Get()
  findAll() {
    return this.client.send('orders.findAll', {});
  }

@Get('user/:userId')
findByUser(
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.client.send('orders.findByUser', userId);
}


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('orders.findOne', id);
  }


@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() data: UpdateOrderDto,
) {
  return this.client.send('orders.update', {
    id,
    data,
  });
}

@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.client.send('orders.remove', id);
}

}
