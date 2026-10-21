
import {
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  @MinLength(3)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total!: number;


}

import { IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total?: number;
}