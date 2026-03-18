import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
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
        UserService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', password: 'hashed', name: 'User 1' },
        { id: '2', email: 'user2@example.com', password: 'hashed', name: 'User 2' },
      ];

      // Mock the main query
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        })
        // Mock the count query
        .mockReturnValueOnce({
          from: jest.fn().mockResolvedValue([{ count: 2 }]),
        });

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].password).toBeUndefined();
      expect(result.data[0].email).toBe('user1@example.com');
      expect(result.total).toBe(2);
      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a user without password', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', name: 'Test User' };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await service.findOne('1') as any;

      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
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
    it('should create a new user without password', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: '1', ...createUserDto, password: 'hashed', role: 'user' },
          ]),
        }),
      });

      const result = await service.create(createUserDto) as any;

      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { name: 'Updated Name' };
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', name: 'Old Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      const result = await service.update('1', updateUserDto) as any;

      expect(result.name).toBe('Updated Name');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', name: 'Test User' };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.remove('1');

      expect(result.message).toBe('用户删除成功');
    });

    it('should throw NotFoundException when user not found', async () => {
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
