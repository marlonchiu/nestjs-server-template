import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, count, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { orders } from '../../database/schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async findAll(pageNum: number = 1, pageSize: number = 10) {
    const offset = (pageNum - 1) * pageSize;

    const allOrders = await this.db.select().from(orders).limit(pageSize).offset(offset);

    const [result] = await this.db.select({ count: sql<number>`count(*)` }).from(orders);
    const total = result?.count ?? 0;

    return {
      data: allOrders,
      total,
      pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    // 服务端计算订单金额，不信任客户端传入的值
    const calculatedTotalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 验证客户端传入的金额与服务端计算的是否一致
    if (Math.abs(calculatedTotalAmount - createOrderDto.totalAmount) > 0.01) {
      throw new BadRequestException('订单金额验证失败');
    }

    const [newOrder] = await this.db
      .insert(orders)
      .values({
        userId: createOrderDto.userId,
        totalAmount: String(createOrderDto.totalAmount),
        items: createOrderDto.items,
        status: 'pending',
      })
      .returning();

    return newOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const [existingOrder] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!existingOrder) {
      throw new NotFoundException('订单不存在');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
    }

    // 如果更新了 items 或 totalAmount，验证金额
    if (updateOrderDto.items !== undefined || updateOrderDto.totalAmount !== undefined) {
      const items = (updateOrderDto.items || existingOrder.items) as any[];
      const totalAmount = updateOrderDto.totalAmount;

      // 服务端重新计算金额
      const calculatedTotalAmount = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

      // 验证客户端传入的金额与服务端计算的是否一致
      if (totalAmount !== undefined && Math.abs(calculatedTotalAmount - totalAmount) > 0.01) {
        throw new BadRequestException('订单金额验证失败');
      }

      // 使用计算后的金额
      updateData.totalAmount = String(calculatedTotalAmount);
      updateData.items = items;
    }

    const [updatedOrder] = await this.db
      .update(orders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return updatedOrder;
  }

  async remove(id: string) {
    const [existingOrder] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!existingOrder) {
      throw new NotFoundException('订单不存在');
    }

    await this.db.delete(orders).where(eq(orders.id, id));

    return { message: '订单删除成功' };
  }
}
