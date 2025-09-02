import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { Role } from '../roles/entities/role.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserRolesDto } from './dto/update-user-roles.dto'

export class UsersRepositoryMock {
  create = jest.fn()
  save = jest.fn()
  find = jest.fn()
  findOne = jest.fn()
}
export class RolesRepositoryMock {
  findByIds = jest.fn()
}

describe('UsersService', () => {
  let service: UsersService
  let usersRepo: UsersRepositoryMock
  let rolesRepo: RolesRepositoryMock

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: [],
  } as User

  const mockRole: Role = { id: 1, name: 'USER' } as Role

  const createUserDto: CreateUserDto = {
    email: 'test@example.com',
    name: 'Test User',
  }

  const updateUserRolesDto: UpdateUserRolesDto = {
    roleIds: [1, 2],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: UsersRepositoryMock,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: RolesRepositoryMock,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    usersRepo = (service as any).usersRepository as UsersRepositoryMock
    rolesRepo = (service as any).rolesRepository as RolesRepositoryMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('creates and returns a user', async () => {
      usersRepo.create.mockReturnValueOnce(mockUser)
      usersRepo.save.mockResolvedValueOnce(mockUser)

      const result = await service.create(createUserDto)

      expect(usersRepo.create).toHaveBeenCalledWith(createUserDto)
      expect(usersRepo.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })
  })

  describe('findAll', () => {
    it('returns an array of users with roles', async () => {
      const expected = [mockUser]
      usersRepo.find.mockResolvedValueOnce(expected)

      const result = await service.findAll()

      expect(usersRepo.find).toHaveBeenCalledWith({ relations: ['roles'] })
      expect(result).toEqual(expected)
    })
  })

  describe('findOne', () => {
    it('returns a user with roles when found', async () => {
      usersRepo.findOne.mockResolvedValueOnce(mockUser)

      const result = await service.findOne(1)

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      })
      expect(result).toEqual(mockUser)
    })

    it('returns null when user is not found', async () => {
      usersRepo.findOne.mockResolvedValueOnce(null)

      const result = await service.findOne(999)

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      })
      expect(result).toBeNull()
    })
  })

  describe('updateRoles', () => {
    it('updates user roles and returns the updated user', async () => {
      usersRepo.findOne.mockResolvedValueOnce({ ...mockUser })
      rolesRepo.findByIds.mockResolvedValueOnce([mockRole] as Role[])
      usersRepo.save.mockResolvedValueOnce({ ...mockUser, roles: [mockRole] })

      const result = await service.updateRoles(1, updateUserRolesDto)

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      })
      expect(rolesRepo.findByIds).toHaveBeenCalledWith([1, 2])
      expect(usersRepo.save).toHaveBeenCalledWith({
        ...mockUser,
        roles: [mockRole],
      })
      expect(result).toEqual({ ...mockUser, roles: [mockRole] })
    })

    it('throws when user is not found', async () => {
      usersRepo.findOne.mockResolvedValueOnce(null)

      await expect(
        service.updateRoles(999, updateUserRolesDto),
      ).rejects.toThrow('User with ID 999 not found')

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      })
      expect(rolesRepo.findByIds).not.toHaveBeenCalled()
      expect(usersRepo.save).not.toHaveBeenCalled()
    })
  })
})
