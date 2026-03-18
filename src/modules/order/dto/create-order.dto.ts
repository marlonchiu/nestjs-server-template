import { IsString, IsNumber, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItem {
  @ApiProperty({ example: '商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: '商品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: '用户ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ type: [OrderItem] })
  @IsArray()
  items: OrderItem[];
}
