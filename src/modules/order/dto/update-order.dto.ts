import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsOptional()
  status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}
