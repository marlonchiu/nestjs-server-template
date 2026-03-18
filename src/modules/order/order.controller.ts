import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OwnershipGuard } from '../../common/guards/ownership.guard';
import { CheckOwnership } from '../../common/decorators/check-ownership.decorator';

@ApiTags('订单')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({ status: 200, description: '返回订单列表' })
  async findAll(
    @Query('pageNum') pageNum: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.orderService.findAll(Number(pageNum), Number(pageSize));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '返回订单详情' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @UseGuards(OwnershipGuard)
  @CheckOwnership()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订单' })
  @ApiResponse({ status: 200, description: '订单更新成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @UseGuards(OwnershipGuard)
  @CheckOwnership()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiResponse({ status: 200, description: '订单删除成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @UseGuards(OwnershipGuard)
  @CheckOwnership()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.remove(id);
  }
}
