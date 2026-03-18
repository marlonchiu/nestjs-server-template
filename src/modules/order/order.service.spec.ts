import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn(),
      from: jest.fn(),
      where: jest.fn(),
      limit: jest.fn(),
      insert: jest.fn(),
      values: jest.fn(),
      returning: jest.fn(),
      update: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [
        { id: '1', userId: '1', totalAmount: '100.00', status: 'pending', items: [] },
        { id: '2', userId: '2', totalAmount: '200.00', status: 'completed', items: [] },
      ];

      // Mock the main query and count query
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue(mockOrders),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockResolvedValue([{ count: 2 }]),
        });

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('1');
      expect(result.total).toBe(2);
      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder = { id: '1', userId: '1', totalAmount: '100.00', status: 'pending', items: [] };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      });

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(result.totalAmount).toBe('100.00');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        userId: '1',
        totalAmount: 100.00,
        items: [{ productId: 'p1', productName: 'Product', price: 50, quantity: 2 }],
      };

      const mockOrder = { id: '1', ...createOrderDto, status: 'pending' };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockOrder]),
        }),
      });

      const result = await service.create(createOrderDto);

      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto: { status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' } = { status: 'completed' };
      const mockOrder = { id: '1', userId: '1', totalAmount: '100.00', status: 'pending', items: [] };
      const updatedOrder = { ...mockOrder, status: 'completed' };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedOrder]),
          }),
        }),
      });

      const result = await service.update('1', updateOrderDto);

      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.update('999', { status: 'completed' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const mockOrder = { id: '1', userId: '1', totalAmount: '100.00', status: 'pending', items: [] };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      });

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.remove('1');

      expect(result.message).toBe('订单删除成功');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
