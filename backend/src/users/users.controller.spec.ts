import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test',
      };
      
      const result = { id: 1, ...createUserDto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toBe(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        { id: 1, email: 'test1@example.com', name: 'Test1' },
        { id: 2, email: 'test2@example.com', name: 'Test2' }
      ];
      
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const result = { id: 1, email: 'test@example.com', name: 'User' };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('updateRoles', () => {
    it('should update user roles and return the updated user', async () => {
      const updateUserRolesDto: UpdateUserRolesDto = {
        roleIds: [1, 2],
      };
      
      const result = { 
        id: 1, 
        email: 'test@example.com', 
        name: 'Test', 
        roles: [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }]
      };
      
      mockUsersService.updateRoles.mockResolvedValue(result);

      expect(await controller.updateRoles('1', updateUserRolesDto)).toBe(result);
      expect(mockUsersService.updateRoles).toHaveBeenCalledWith(1, updateUserRolesDto);
    });

    it('should throw NotFoundException when update fails', async () => {
      const updateUserRolesDto: UpdateUserRolesDto = {
        roleIds: [1, 2],
      };
      
      mockUsersService.updateRoles.mockRejectedValue(new Error('User not found'));

      await expect(controller.updateRoles('1', updateUserRolesDto)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.updateRoles).toHaveBeenCalledWith(1, updateUserRolesDto);
    });
  });
});